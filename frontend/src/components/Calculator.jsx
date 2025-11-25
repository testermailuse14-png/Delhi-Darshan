import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Car, IndianRupee } from "lucide-react";
import { toast } from "sonner";

const CabCalculator = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  const calculatePrice = () => {
    if (!pickup || !dropoff) {
      toast.error("Please enter both pickup and drop locations");
      return;
    }
    
    // Simple estimation: ₹10 per km base + random variance
    const baseDistance = Math.floor(Math.random() * 20) + 5; // 5-25 km
    const pricePerKm = 12;
    const baseFare = 50;
    const price = baseFare + (baseDistance * pricePerKm);
    
    setEstimatedPrice(price);
    toast.success("Fare calculated successfully!");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-500">
          <Car className="h-6 w-6  text-amber-500" />
          Cab Fare Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pickup">Pickup Location</Label>
          <Input
            id="pickup"
            placeholder="Enter pickup location..."
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dropoff">Drop Location</Label>
          <Input
            id="dropoff"
            placeholder="Enter drop location..."
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
          />
        </div>
        <Button onClick={calculatePrice} className="w-full bg-amber-600" size="lg">
          Calculate Fare
        </Button>
        
        {estimatedPrice !== null && (
          <div className="mt-6 p-6 bg-linear-to from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Estimated Fare</p>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-8 w-8 text-green-600" />
              <span className="text-4xl font-bold text-primary">{estimatedPrice}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">*This is an estimated fare. Actual fare may vary.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CabCalculator;