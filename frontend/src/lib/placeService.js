let googleMapsLoadingPromise = null;

const loadGoogleMaps = () => {
  if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve();
  }

  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  console.log(apiKey);
  if (!apiKey) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API is not set'));
  }

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    // If a script is already present, hook into its events
    const existingTagged = document.querySelector('script[data-google-maps="loader"]');
    const existingAny = existingTagged || document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');

    if (existingAny) {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        existingAny.addEventListener('load', () => resolve());
        existingAny.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-google-maps', 'loader');
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });

  return googleMapsLoadingPromise;
};

export const searchPlaces = (query, callback) => {
  if (!query || query.trim().length === 0) {
    callback([], null);
    return;
  }

  loadGoogleMaps()
    .then(() => {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' },
        },
        (predictions, status) => {
          const G = (typeof window !== 'undefined' && window.google) ? window.google : null;
          const okStatus = (G && G.maps && G.maps.places)
            ? G.maps.places.PlacesServiceStatus.OK
            : 'OK';

          if (status === okStatus && predictions) {
            const mapped = predictions.map((p) => ({
              main_text: p.structured_formatting?.main_text || p.description || '',
              secondary_text: p.structured_formatting?.secondary_text || '',
              description: p.description || '',
              place_id: p.place_id,
            }));
            callback(mapped, 'OK');
          } else {
            callback([], status);
          }
        }
      );
    })
    .catch(() => callback([], 'LOAD_ERROR'));
};

export const getPlaceDetails = (placeId, callback) => {
  if (!placeId) {
    callback(null, null);
    return;
  }

  loadGoogleMaps()
    .then(() => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(
        {
          placeId,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'photos',
            'rating',
            'user_ratings_total',
            'reviews',
            'opening_hours',
            'website',
            'formatted_phone_number',
            'price_level',
            'types',
          ],
        },
        (result, status) => {
          const G = (typeof window !== 'undefined' && window.google) ? window.google : null;
          const okStatus = (G && G.maps && G.maps.places)
            ? G.maps.places.PlacesServiceStatus.OK
            : 'OK';

          if (status === okStatus && result) {
            const placeData = {
              title: result.name,
              location: result.formatted_address,
              lat: result.geometry?.location?.lat?.() ?? null,
              lng: result.geometry?.location?.lng?.() ?? null,
              rating: result.rating ?? null,
              userRatingsTotal: result.user_ratings_total ?? null,
              reviews: result.reviews ?? [],
              hours: result.opening_hours?.weekday_text?.join(', ') || null,
              website: result.website || null,
              phone: result.formatted_phone_number || null,
              priceLevel: result.price_level ?? null,
              types: result.types ?? [],
              placeId,
            };
            callback(placeData, null);
          } else {
            callback(null, status);
          }
        }
      );
    })
    .catch(() => callback(null, 'LOAD_ERROR'));
};

export const getNearbyPlaces = (lat, lng, type = 'cafe', radius = 1000, callback) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    callback([], null);
    return;
  }

  loadGoogleMaps()
    .then(() => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.nearbySearch(
        {
          location: { lat, lng },
          radius,
          type,
        },
        (results, status) => {
          const G = (typeof window !== 'undefined' && window.google) ? window.google : null;
          const okStatus = (G && G.maps && G.maps.places)
            ? G.maps.places.PlacesServiceStatus.OK
            : 'OK';

          if (status === okStatus && results) {
            callback(results, null);
          } else {
            callback([], status);
          }
        }
      );
    })
    .catch(() => callback([], 'LOAD_ERROR'));
};

export const getPhotoForPlace = (name, lat, lng, callback) => {
  if (!name) {
    callback(null, 'NO_QUERY');
    return;
  }

  loadGoogleMaps()
    .then(() => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));

      service.nearbySearch(
        {
          location: { lat, lng },
          radius: 2000,
          keyword: name,
          type: 'point_of_interest',
        },
        (results, status) => {
          const G = (typeof window !== 'undefined' && window.google) ? window.google : null;
          const okStatus = (G && G.maps && G.maps.places)
            ? G.maps.places.PlacesServiceStatus.OK
            : 'OK';

          if (status === okStatus && results && results.length) {
            const r = results[0];
            if (r.photos && r.photos.length) {
              const url = r.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
              callback(url, null);
            } else if (r.place_id) {
              service.getDetails({ placeId: r.place_id, fields: ['photos'] }, (detail, dstatus) => {
                const okD = (window.google && window.google.maps && window.google.maps.places)
                  ? window.google.maps.places.PlacesServiceStatus.OK
                  : 'OK';
                if (dstatus === okD && detail?.photos && detail.photos.length) {
                  const url2 = detail.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
                  callback(url2, null);
                } else {
                  callback(null, dstatus);
                }
              });
            } else {
              callback(null, 'NO_PHOTO');
            }
          } else {
            callback(null, status);
          }
        }
      );
    })
    .catch(() => callback(null, 'LOAD_ERROR'));
};

export const geocodeAddress = (address, callback) => {
  if (!address) {
    callback(null, 'NO_ADDRESS');
    return;
  }

  loadGoogleMaps()
    .then(() => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        const G = (typeof window !== 'undefined' && window.google) ? window.google : null;
        const okStatus = (G && G.maps) ? G.maps.GeocoderStatus.OK : 'OK';
        if (status === okStatus && results && results.length) {
          const loc = results[0].geometry.location;
          callback({ lat: loc.lat(), lng: loc.lng(), formatted_address: results[0].formatted_address }, null);
        } else {
          callback(null, status);
        }
      });
    })
    .catch(() => callback(null, 'LOAD_ERROR'));
};
