import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HiddenGemCard from "@/components/HiddenGemCard";
import HiddenGemsSubmit from "@/components/HiddenGemsSubmit";
import GoogleMapComponent from "@/components/GoogleMapComponent";
import { getPhotoForPlace, geocodeAddress } from '@/lib/placeService';
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
      const response = await hiddenGemsApi.getAll();
      const gemsData = response.gems || [];

      // 1. Set initial state using DB data (Preserve the DB image!)
      setGems(gemsData.map(g => ({
        ...g,
        submittedBy: g.user?.email || 'Anonymous',
        // FIX: Use the image from DB if it exists, otherwise null
        image: g.image || null, 
      })));

      // 2. Fetch fallback photos ONLY for gems that don't have a user-uploaded image
      gemsData.forEach((gem, idx) => {
        if (!gem.image) { 
          getPhotoForPlace(gem.name, gem.lat, gem.lng, (url) => {
            if (url) {
              setGems((prev) => {
                const copy = [...prev];
                // Check if index still exists to prevent race conditions
                if (copy[idx]) {
                  copy[idx] = { ...copy[idx], image: url };
                }
                return copy;
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error fetching gems:', error);
      toast.error('Failed to load hidden gems');
    } finally {
      setLoading(false);
    }
  };

  const addGemToState = (newGem) => {
    // 3. Add new gem to top of list
    setGems((prev) => [newGem, ...prev]);

    // Only try to fetch a Google photo if the user didn't upload one
    if (!newGem.image) {
      getPhotoForPlace(newGem.name, newGem.lat, newGem.lng, (url) => {
        if (url) {
          setGems((prev) => {
            const copy = [...prev];
            if (copy[0].id === newGem.id) {
               copy[0] = { ...copy[0], image: url };
            }
            return copy;
          });
        }
      });
    }
  };

  const handleAdd = async (payload) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to share a hidden gem');
      navigate('/signin');
      return;
    }

    try {
      // FIX: Destructure 'image' from payload
      const { name, description, address, lat, lng, image } = payload;
      
      if (!name) {
        toast.error('Name is required');
        return;
      }

      let finalLat = lat;
      let finalLng = lng;
      let finalAddress = address;

      // Logic to handle coordinates/geocoding
      if (lat && lng) {
        finalLat = typeof lat === 'string' ? parseFloat(lat) : lat;
        finalLng = typeof lng === 'string' ? parseFloat(lng) : lng;
      } else if (address) {
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

      // FIX: Include 'image' in the API call object
      const response = await hiddenGemsApi.create({
        name,
        description,
        address: finalAddress || address || '',
        lat: finalLat,
        lng: finalLng,
        image: image, // Pass the Supabase URL here
      });

      const newGem = {
        ...response.gem,
        submittedBy: response.gem.user?.email || 'Anonymous',
        // Ensure we use the image returned from backend
        image: response.gem.image || image || null, 
      };

      addGemToState(newGem);
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
            <HiddenGemCard key={gem.id || index} {...gem} />
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