import { useState, useEffect } from 'react';
import { X, Star, MapPin, Phone, Globe, Clock, Coffee } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const PlaceDetailModal = ({ place, isOpen, onClose }) => {
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (isOpen && place) {
      fetchPlaceDetails();
      fetchNearbyPlaces();
    }
  }, [isOpen, place]);

  const fetchPlaceDetails = async () => {
    setLoading(true);
    try {
      if (!window.google || !place.placeId) {
        setLoading(false);
        return;
      }

      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.getDetails(
        {
          placeId: place.placeId,
          fields: [
            'photos',
            'rating',
            'reviews',
            'opening_hours',
            'website',
            'formatted_phone_number',
            'price_level',
          ],
        },
        (result, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            if (result.photos) {
              const photoUrls = result.photos.map((photo) =>
                photo.getUrl({ maxWidth: 600, maxHeight: 400 })
              );
              setPhotos(photoUrls);
            }
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching place details:', error);
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async () => {
    try {
      if (!window.google || !place.lat || !place.lng) return;

      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.nearbySearch(
        {
          location: { lat: place.lat, lng: place.lng },
          radius: 1000,
          type: 'cafe',
          maxResults: 6,
        },
        (results, status) => {
          const ok = window.google?.maps?.places ? window.google.maps.places.PlacesServiceStatus.OK : 'OK';
          if (status === ok && results && results.length) {
            const top = results.slice(0, 5);

            const enriched = top.map((r) =>
              new Promise((resolve) => {
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
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  if (!isOpen || !place) return null;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>

          {/* Photos Carousel */}
          {photos.length > 0 ? (
            <div className="relative w-full h-96 bg-gray-200 overflow-hidden">
              <img
                src={photos[currentPhotoIndex]}
                alt={`${place.title} photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextPhoto}
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
            <div className="w-full h-96 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <MapPin className="h-16 w-16 text-amber-400 opacity-50" />
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {place.title}
              </h1>
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
                    {place.rating?.toFixed(1) || 'N/A'} ({place.userRatingsTotal || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {place.description && (
              <p className="text-gray-700 leading-relaxed">
                {place.description}
              </p>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              {place.location && (
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{place.location}</p>
                  </div>
                </div>
              )}

              {/* Hours */}
              {place.hours && (
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Hours</p>
                    <p className="text-sm text-gray-600">{place.hours}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {place.phone && (
                <div className="flex gap-3">
                  <Phone className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <a href={`tel:${place.phone}`} className="text-sm text-blue-600 hover:underline">
                      {place.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {place.website && (
                <div className="flex gap-3">
                  <Globe className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Website</p>
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      Visit
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Nearby Cafes */}
            {nearbyPlaces.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-amber-600" />
                  Nearby Cafes & Restaurants
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {nearbyPlaces.map((nearbyPlace, index) => (
                    <Card key={index} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1">
                          {nearbyPlace.name}
                        </h3>
                        {nearbyPlace.rating && (
                          <div className="flex items-center gap-1 ml-2">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-gray-700">
                              {nearbyPlace.rating}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {nearbyPlace.vicinity}
                      </p>
                      <div className="flex gap-2">
                        {nearbyPlace.isOpenNow && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Open Now
                              </span>
                            )}
                        {nearbyPlace.types && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            {nearbyPlace.types[0].replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {place.reviews && place.reviews.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-3">
                  {place.reviews.slice(0, 3).map((review, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{review.author_name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{review.text}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.time * 1000).toLocaleDateString()}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={onClose} className="flex-1 bg-amber-600 hover:bg-amber-700">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailModal;
