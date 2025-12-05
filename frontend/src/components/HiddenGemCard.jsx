import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MapPin, User } from "lucide-react";

const HiddenGemCard = ({ name, description, submittedBy, image, address }) => {
  const [imageError, setImageError] = useState(false); // State to track if image fails to load

  // Log the image URL to console for debugging
  if (image) {
    // console.log(`Rendering card for ${name}, Image URL:`, image);
  }

  // Optional: make address clickable to open in Google Maps
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return (
    <Card className="hidden-gem-card relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:border-amber-400 hover:ring-2 hover:ring-amber-300/60 bg-white group">
      {/* Decorative Sparkle Icon */}
      <div className="absolute top-3 right-3 z-10">
        <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-md" />
      </div>

      {/* Image Rendering Logic */}
      {/* Only show image if it exists AND hasn't failed to load */}
      {image && !imageError ? (
        <div className="hidden-gem-image h-48 w-full overflow-hidden relative bg-slate-100">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              console.error(`Failed to load image for ${name}. URL: ${image}`);
              setImageError(true); // Revert to placeholder if link is broken (403/404)
            }}
          />
        </div>
      ) : (
        // Fallback Placeholder (Shown if no image OR if image broken)
        <div className="hidden-gem-placeholder h-48 w-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center border-b border-amber-100">
          <div className="text-center p-4">
            <Sparkles className="h-10 w-10 text-amber-300 mx-auto mb-2 opacity-60" />
            <span className="text-xs text-amber-800/40 font-medium">
              {imageError ? "Image unavailable" : "No photo available"}
            </span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2 pr-8 font-serif text-amber-950 leading-tight">{name}</h3>
          
          {/* Address Section */}
          {address && (
            <div className="flex items-start gap-1.5 text-xs text-amber-700/80 font-medium">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-amber-800 break-words"
                >
                  {address}
                </a>
              ) : (
                <span>{address}</span>
              )}
            </div>
          )}
        </div>

        <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {description || "No description provided."}
        </p>

        {/* Footer: Submitted By */}
        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          {submittedBy ? (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span className="italic">Shared by {submittedBy.split('@')[0]}</span>
            </div>
          ) : (
            <span className="italic">Community contribution</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HiddenGemCard;