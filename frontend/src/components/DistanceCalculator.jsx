import { useState, useRef, useEffect } from 'react';
import { GoogleMap, Autocomplete, Marker } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Car, IndianRupee, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
  marginTop: '16px',
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

export const DistanceCalculator = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const pickupAutocompleteRef = useRef(null);
  const dropAutocompleteRef = useRef(null);

  const handlePickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      if (place.geometry) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setPickupCoords(coords);
        setPickupLocation(place.formatted_address);
        setMapCenter(coords);
        setMapZoom(15);
      }
    }
  };

  const handleDropPlaceChanged = () => {
    if (dropAutocompleteRef.current) {
      const place = dropAutocompleteRef.current.getPlace();
      if (place.geometry) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setDropCoords(coords);
        setDropLocation(place.formatted_address);
      }
    }
  };

  const calculateDistance = () => {
    if (!pickupCoords || !dropCoords) {
      toast.error('Please select both pickup and drop locations');
      return;
    }

    if (!window.google || !window.google.maps) {
      toast.error('Google Maps API is still loading. Please wait and try again.');
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [pickupCoords],
        destinations: [dropCoords],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === window.google.maps.DistanceMatrixStatus.OK) {
          const distanceValue = response.rows[0].elements[0].distance.value / 1000; // Convert to km
          setDistance(distanceValue);

          // Calculate price: ₹50 base fare + ₹12 per km
          const baseFare = 50;
          const pricePerKm = 12;
          const price = Math.round(baseFare + distanceValue * pricePerKm);
          setEstimatedPrice(price);

          toast.success(`Distance: ${distanceValue.toFixed(2)} km`);
        } else {
          toast.error('Unable to calculate distance. Please try again.');
        }
      }
    );
  };

  const markers = [];
  if (pickupCoords) {
    markers.push({
      lat: pickupCoords.lat,
      lng: pickupCoords.lng,
      title: 'Pickup Location',
    });
  }
  if (dropCoords) {
    markers.push({
      lat: dropCoords.lat,
      lng: dropCoords.lng,
      title: 'Drop Location',
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-500">
          <Car className="h-6 w-6 text-amber-500" />
          Cab Fare Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup Location</Label>
            <Autocomplete
              onLoad={(autocomplete) => {
                pickupAutocompleteRef.current = autocomplete;
              }}
              onPlaceChanged={handlePickupPlaceChanged}
            >
              <Input
                id="pickup"
                type="text"
                placeholder="Enter pickup location..."
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
            </Autocomplete>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff">Drop Location</Label>
            <Autocomplete
              onLoad={(autocomplete) => {
                dropAutocompleteRef.current = autocomplete;
              }}
              onPlaceChanged={handleDropPlaceChanged}
            >
              <Input
                id="dropoff"
                type="text"
                placeholder="Enter drop location..."
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
              />
            </Autocomplete>
          </div>

          {(pickupCoords || dropCoords) && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
              }}
            >
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  title={marker.title}
                />
              ))}
            </GoogleMap>
          )}

          <Button onClick={calculateDistance} className="w-full bg-amber-600" size="lg">
            Calculate Fare
          </Button>

          {distance && estimatedPrice && (
            <div className="mt-6 p-6 bg-linear-to from-primary/10 to-accent/10 rounded-lg border border-primary/20 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Distance</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <span className="text-2xl font-bold text-primary">{distance.toFixed(2)} km</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Estimated Fare</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-8 w-8 text-green-600" />
                  <span className="text-4xl font-bold text-primary">{estimatedPrice}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">*This is an estimated fare. Actual fare may vary based on traffic and demand.</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default DistanceCalculator;
