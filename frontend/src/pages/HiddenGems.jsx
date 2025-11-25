import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HiddenGemCard from "@/components/HiddenGemCard";
import HiddenGemsSubmit from "@/components/HiddenGemsSubmit";
import GoogleMapComponent from "@/components/GoogleMapComponent";
import { getPhotoForPlace, geocodeAddress } from '@/lib/placeService';
import { MapPin } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { hiddenGemsApi } from '@/lib/api';
import { toast } from 'sonner';

export const HiddenGems = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGems();
  }, []);

  const fetchGems = async () => {
    try {
      setLoading(true);
      console.log('Fetching hidden gems...');
      const response = await hiddenGemsApi.getAll();
      console.log('Response:', response);
      const gemsData = response.gems || [];
      console.log('Gems data:', gemsData);

      if (!gemsData || gemsData.length === 0) {
        console.warn('No gems returned from API');
      }

      setGems(gemsData.map(g => ({
        ...g,
        submittedBy: g.user?.email || 'Anonymous',
        image: null,
      })));

      // Fetch photos for each gem
      gemsData.forEach((gem, idx) => {
        getPhotoForPlace(gem.name, gem.lat, gem.lng, (url) => {
          if (url) {
            setGems((prev) => {
              const copy = [...prev];
              if (copy[idx]) {
                copy[idx] = { ...copy[idx], image: url };
              }
              return copy;
            });
          }
        });
      });
    } catch (error) {
      console.error('Error fetching gems:', error);
      console.error('API URL:', import.meta.env.VITE_API_URL);
      toast.error('Failed to load hidden gems: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addGemToState = (newGem) => {
    setGems((prev) => [newGem, ...prev]);

    // fetch photo
    getPhotoForPlace(newGem.name, newGem.lat, newGem.lng, (url) => {
      if (url) {
        setGems((prev) => {
          const copy = [...prev];
          copy[0] = { ...copy[0], image: url };
          return copy;
        });
      }
    });
  };

  const handleAdd = async (payload) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to share a hidden gem');
      navigate('/signin');
      return;
    }

    try {
      const { name, description, address, lat, lng } = payload;
      
      if (!name) {
        toast.error('Name is required');
        return;
      }

      let finalLat = lat;
      let finalLng = lng;
      let finalAddress = address;

      // If we have coordinates, use them directly
      if (lat && lng) {
        finalLat = typeof lat === 'string' ? parseFloat(lat) : lat;
        finalLng = typeof lng === 'string' ? parseFloat(lng) : lng;
      } else if (address) {
        // Geocode the address
        const geocodePromise = new Promise((resolve) => {
          geocodeAddress(address, (res) => {
            if (res) {
              finalLat = res.lat;
              finalLng = res.lng;
              finalAddress = res.formatted_address;
            }
            resolve();
          });
        });

        await geocodePromise;
      }

      // Create the gem on the backend
      const response = await hiddenGemsApi.create({
        name,
        description,
        address: finalAddress || address || '',
        lat: finalLat,
        lng: finalLng,
      });

      const newGem = {
        ...response.gem,
        submittedBy: response.gem.user?.email || 'Anonymous',
        image: null,
      };

      addGemToState(newGem);
      toast.success('Hidden gem shared successfully!');
    } catch (error) {
      console.error('Error adding gem:', error);
      toast.error(error.message || 'Failed to share hidden gem');
    }
  };

  const mapMarkers = gems
    .filter((g) => typeof g.lat === 'number' && typeof g.lng === 'number')
    .map((gem) => ({
      title: gem.name,
      lat: gem.lat,
      lng: gem.lng,
      description: gem.description,
      location: gem.address || '',
    }));

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 bg-linear-to-b from-white to-amber-600 flex items-center justify-center">
        <p className="text-gray-600">Loading hidden gems...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-linear-to-b from-white to-amber-600 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-amber-600">
            Hidden Gems of Delhi
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover and share Delhi's best-kept secrets
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Gems Location Map</h2>
          <GoogleMapComponent
            markers={mapMarkers}
            zoom={12}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {gems.map((gem, index) => (
            <HiddenGemCard key={index} {...gem} />
          ))}
        </div>

        {!isAuthenticated && (
          <div className="mb-12 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg text-center">
            <p className="text-lg font-semibold text-amber-900 mb-4">
              Sign in to share your hidden gem discoveries!
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              Sign In to Share
            </button>
          </div>
        )}

        {isAuthenticated && (
          <HiddenGemsSubmit onAdd={handleAdd} />
        )}
      </div>
    </main>
  );
};

export default HiddenGems;
