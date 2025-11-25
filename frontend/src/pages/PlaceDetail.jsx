import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPlaceDetails, getNearbyPlaces } from '@/lib/placeService';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  Share2,
  Navigation,
  Coffee,
  Bookmark,
  ArrowLeft,
  Loader,
} from 'lucide-react';
import { toast } from 'sonner';
import redFort from "@/assets/redfort.jpeg";
import qutubMinar from "@/assets/qutub-minar.jpeg";
import lotusTemple from "@/assets/lotustemple.jpeg";
import humayunTomb from "@/assets/humayutomb.jpeg";

const popularPlaces = [
  {
    name: "Red Fort",
    image: redFort,
    description: "A historic fort in Old Delhi that served as the main residence of the Mughal emperors.",
    location: "Netaji Subhash Marg, Chandni Chowk",
    lat: 28.6562,
    lng: 77.2410,
  },
  {
    name: "Qutub Minar",
    image: qutubMinar,
    description: "A UNESCO World Heritage Site, this 73-meter tall minaret is a masterpiece of Indo-Islamic architecture.",
    location: "Mehrauli",
    lat: 28.5244,
    lng: 77.1855,
  },
  {
    name: "Lotus Temple",
    image: lotusTemple,
    description: "A Bahá'í House of Worship noted for its flower-like shape and stunning modern architecture.",
    location: "Bahapur, Kalkaji",
    lat: 28.5535,
    lng: 77.2588,
  },
  {
    name: "Humayun's Tomb",
    image: humayunTomb,
    description: "The tomb of the Mughal Emperor Humayun, a UNESCO World Heritage Site and inspiration for the Taj Mahal.",
    location: "Nizamuddin East",
    lat: 28.5921,
    lng: 77.2519,
  },
];

export const PlaceDetail = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [place, setPlace] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (placeId) {
      const decodedPlaceId = decodeURIComponent(placeId);

      // Check if it's a predefined place
      const predefinedPlace = popularPlaces.find(p => p.name === decodedPlaceId);

      if (predefinedPlace) {
        // Handle predefined place
        const placeData = {
          title: predefinedPlace.name,
          description: predefinedPlace.description,
          location: predefinedPlace.location,
          lat: predefinedPlace.lat,
          lng: predefinedPlace.lng,
          rating: 4.5,
          userRatingsTotal: 1000,
          image: predefinedPlace.image,
        };
        setPlace(placeData);
        if (predefinedPlace.image) {
          setPhotos([predefinedPlace.image]);
        }
        if (predefinedPlace.lat && predefinedPlace.lng) {
          fetchNearbyPlaces(predefinedPlace.lat, predefinedPlace.lng);
        }
        setLoading(false);
      } else {
        // Handle Google Places API result
        getPlaceDetails(decodedPlaceId, (data, error) => {
          if (data) {
            setPlace(data);
            if (data.lat && data.lng) {
              fetchNearbyPlaces(data.lat, data.lng);
              fetchPhotos(decodedPlaceId);
            }
          } else {
            toast.error('Failed to load place details');
            navigate('/places');
          }
          setLoading(false);
        });
      }
    }
  }, [placeId, navigate]);

  const fetchPhotos = (id) => {
    if (!window.google) return;
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    service.getDetails(
      {
        placeId: id,
        fields: ['photos'],
      },
      (result) => {
        if (result?.photos) {
          const photoUrls = result.photos.map((photo) =>
            photo.getUrl({ maxWidth: 800, maxHeight: 600 })
          );
          setPhotos(photoUrls);
        }
      }
    );
  };

  const fetchNearbyPlaces = (lat, lng) => {
    if (!window.google) return;
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    service.nearbySearch(
      {
        location: { lat, lng },
        radius: 1000,
        type: 'cafe',
      },
      (results, status) => {
        const ok = window.google?.maps?.places ? window.google.maps.places.PlacesServiceStatus.OK : 'OK';
        if (status === ok && results && results.length) {
          const top = results.slice(0, 5);

          const enriched = top.map((r) =>
            new Promise((resolve) => {
              // Fetch details to use opening_hours.isOpen() which replaced open_now
              service.getDetails(
                { placeId: r.place_id, fields: ['opening_hours', 'name', 'rating', 'vicinity', 'types'] },
                (detail, dStatus) => {
                  const okDetail = window.google?.maps?.places ? window.google.maps.places.PlacesServiceStatus.OK : 'OK';
                  let isOpenNow = false;
                  if (dStatus === okDetail && detail && detail.opening_hours && typeof detail.opening_hours.isOpen === 'function') {
                    try {
                      isOpenNow = detail.opening_hours.isOpen();
                    } catch (e) {
                      isOpenNow = false;
                    }
                  }

                  resolve({
                    ...r,
                    isOpenNow,
                    vicinity: r.vicinity,
                    types: r.types,
                    rating: r.rating,
                  });
                }
              );
            })
          );

          Promise.all(enriched).then((items) => setNearbyPlaces(items));
        }
      }
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.title,
        text: place.description || place.title,
        url: window.location.href,
      });
    } else {
      toast.success('Link copied to clipboard');
    }
  };

  const handleGetDirections = () => {
    if (place.lat && place.lng) {
      const mapsUrl = `https://maps.google.com/?q=${place.lat},${place.lng}`;
      window.open(mapsUrl, '_blank');
      toast.success('Opening directions...');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading place details...</p>
        </div>
      </main>
    );
  }

  if (!place) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Place not found</p>
          <Button onClick={() => navigate('/places')} className="bg-amber-600">
            Back to Places
          </Button>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'About' },
  ];

  return (
    <main className="min-h-screen pt-20 pb-16 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/places')}
          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-6 px-4 md:px-0"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Places
        </button>

        {/* Photo Carousel */}
        {photos.length > 0 ? (
          <div className="relative w-full h-96 md:h-96 bg-gray-200 rounded-xl overflow-hidden mb-6 px-4 md:px-0">
            <img
              src={photos[currentPhotoIndex]}
              alt={place.title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                >
                  →
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-96 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-6 px-4 md:px-0">
            <MapPin className="h-20 w-20 text-amber-400 opacity-50" />
          </div>
        )}

        {/* Title and Info */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{place.title}</h1>
              {place.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(place.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {place.rating?.toFixed(1)} ({place.userRatingsTotal || 0} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={handleGetDirections}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-semibold transition-colors"
            >
              <Navigation className="h-5 w-5" />
              Directions
            </button>
            <button
              onClick={() => toast.success('Saved to your places!')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 text-teal-700 rounded-full font-semibold transition-colors"
            >
              <Bookmark className="h-5 w-5" />
              Save
            </button>
            <button
              onClick={() => toast.success('Showing nearby places...')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 text-teal-700 rounded-full font-semibold transition-colors"
            >
              <Coffee className="h-5 w-5" />
              Nearby
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 text-teal-700 rounded-full font-semibold transition-colors"
            >
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 px-4 md:px-0">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 font-semibold transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-teal-600 border-teal-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 md:px-0">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {/* Description */}
                {place.description && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                    <p className="text-gray-700 leading-relaxed">{place.description}</p>
                  </div>
                )}

                {/* Info Details */}
                <div className="space-y-4">
                  {place.location && (
                    <div className="flex gap-4">
                      <MapPin className="h-6 w-6 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                        <p className="text-gray-900">{place.location}</p>
                      </div>
                    </div>
                  )}

                  {place.hours && (
                    <div className="flex gap-4">
                      <Clock className="h-6 w-6 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Hours</p>
                        <p className="text-green-600 font-semibold">Open</p>
                        <p className="text-gray-700 text-sm">{place.hours}</p>
                      </div>
                    </div>
                  )}

                  {place.phone && (
                    <div className="flex gap-4">
                      <Phone className="h-6 w-6 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                        <a
                          href={`tel:${place.phone}`}
                          className="text-gray-900 hover:text-teal-600 font-medium"
                        >
                          {place.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {place.website && (
                    <div className="flex gap-4">
                      <Globe className="h-6 w-6 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Website</p>
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 font-medium break-all"
                        >
                          {place.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map */}
                {place.lat && place.lng && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                    <GoogleMapComponent
                      markers={[
                        {
                          title: place.title,
                          lat: place.lat,
                          lng: place.lng,
                          description: place.location,
                        },
                      ]}
                      center={{ lat: place.lat, lng: place.lng }}
                      zoom={15}
                      height="400px"
                    />
                  </div>
                )}
              </div>

              {/* Sidebar - Nearby Places */}
              <div>
                {nearbyPlaces.length > 0 && (
                  <div className="sticky top-24">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Coffee className="h-5 w-5 text-amber-600" />
                      Nearby Cafes
                    </h2>
                    <div className="space-y-3">
                      {nearbyPlaces.map((nearby, index) => (
                        <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm flex-1">
                              {nearby.name}
                            </h3>
                            {nearby.rating && (
                              <div className="flex items-center gap-1 ml-2">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold">{nearby.rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{nearby.vicinity}</p>
                          <div className="flex gap-2 flex-wrap">
                            {nearby.isOpenNow && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Open Now
                              </span>
                            )}
                            {nearby.types && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded capitalize">
                                {nearby.types[0].replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              {place.reviews && place.reviews.length > 0 ? (
                <div className="space-y-6">
                  {place.reviews.map((review, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{review.author_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.time * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.text}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {place.priceLevel && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Price</p>
                      <p className="text-gray-900">{place.priceLevel}</p>
                    </div>
                  )}
                  {place.types && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Type
                      </p>
                      <p className="text-gray-900 capitalize">
                        {place.types[0].replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {place.description && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About This Place</h2>
                  <p className="text-gray-700 leading-relaxed">{place.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default PlaceDetail;
