import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

const HiddenGemsSubmit = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please provide the place name");
      return;
    }

    const payload = {
      name,
      description,
      address: address || '',
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
    };

    if (typeof onAdd === 'function') {
      onAdd(payload);
      toast.success("Thank you for sharing this hidden gem!");
    } else {
      toast.success("Thank you for sharing this hidden gem! (local only)");
    }

    // Reset form
    setName("");
    setDescription("");
    setAddress("");
    setLat("");
    setLng("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-6 w-6 text-amber-300" />
          Share a Hidden Gem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gem-name">Place Name</Label>
            <Input
              id="gem-name"
              placeholder="Enter the name of the place..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gem-description">Description</Label>
            <Textarea
              id="gem-description"
              placeholder="Tell us what makes this place special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="gem-address">Address</Label>
            <Input
              id="gem-address"
              placeholder="Address or place name"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
            <div className="space-y-2">
              <Label htmlFor="gem-lat">Latitude</Label>
              <Input
                id="gem-lat"
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gem-lng">Longitude</Label>
              <Input
                id="gem-lng"
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
          </div>

        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
          Submit Hidden Gem
        </Button>
      </form>
    </CardContent>
  </Card>
);
};

export default HiddenGemsSubmit;
