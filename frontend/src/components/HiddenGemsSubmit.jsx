import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient"; 

const BUCKET_NAME = "hidden-gems"; 

const HiddenGemsSubmit = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  
  // Image State
  const [imageFile, setImageFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(""); 
  const [isUploading, setIsUploading] = useState(false); 

  // 1. Handle File Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl("");
  };

  // 2. Upload Logic
  const uploadImageToSupabase = async () => {
    if (!imageFile) return null;

    try {
      // SANITIZATION: Remove spaces/special chars from filename
      const fileExt = imageFile.name.split('.').pop();
      const randomString = Math.random().toString(36).substring(7);
      const cleanFileName = `${Date.now()}-${randomString}.${fileExt}`;
      const filePath = `uploads/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log("Supabase Public URL generated:", data.publicUrl); // DEBUG LOG
      return data.publicUrl;
    } catch (error) {
      console.error("Supabase Upload Error:", error);
      toast.error("Failed to upload image. Please try again.");
      return null;
    }
  };

  // 3. Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please provide the place name");
      return;
    }

    setIsUploading(true); 

    try {
      let finalImageUrl = null;

      // A. Upload Image
      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase();
        if (!finalImageUrl) {
          setIsUploading(false);
          return; 
        }
      }

      // B. Create Payload
      const payload = {
        name,
        description,
        address: address || '',
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        image: finalImageUrl || null, // Ensure explicitly null if no image
      };

      console.log("Submitting Payload to Parent:", payload); // DEBUG LOG

      // C. Send to Backend via Parent
      if (typeof onAdd === 'function') {
        await onAdd(payload);
        
        // Reset Form
        setName("");
        setDescription("");
        setAddress("");
        setLat("");
        setLng("");
        removeImage();
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsUploading(false); 
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-amber-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-amber-700">
          <Sparkles className="h-6 w-6 text-amber-500" />
          Share a Hidden Gem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <Label htmlFor="gem-name">Place Name *</Label>
            <Input
              id="gem-name"
              placeholder="e.g. Sunder Nursery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUploading}
              className="focus-visible:ring-amber-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gem-image">Photo</Label>
            {!previewUrl ? (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="gem-image"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 border-slate-300 hover:bg-slate-100 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500">
                      <span className="font-semibold">Click to upload</span> a photo
                    </p>
                    <p className="text-xs text-slate-400">PNG, JPG (MAX. 5MB)</p>
                  </div>
                  <Input
                    id="gem-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
            ) : (
              <div className="relative mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md border border-slate-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isUploading}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gem-description">Description</Label>
            <Textarea
              id="gem-description"
              placeholder="Tell us what makes this place special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isUploading}
              className="focus-visible:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="gem-address">Address</Label>
              <Input
                id="gem-address"
                placeholder="Address or nearby landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gem-lat">Latitude (Optional)</Label>
              <Input
                id="gem-lat"
                placeholder="e.g. 28.6139"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gem-lng">Longitude (Optional)</Label>
              <Input
                id="gem-lng"
                placeholder="e.g. 77.2090"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                disabled={isUploading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-6 text-lg shadow-md transition-all hover:scale-[1.01]" 
            size="lg"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading & Saving...
              </>
            ) : (
              "Submit Hidden Gem"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HiddenGemsSubmit;