import { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

export const GoogleMapComponent = ({ 
  markers = [],
  center = defaultCenter,
  zoom = 12,
  showDirections = false,
  directions = null,
  onMarkerClick = null,
  height = '400px'
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const onLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  const handleMarkerClick = (marker, index) => {
    setSelectedMarker(index);
    if (onMarkerClick) {
      onMarkerClick(marker, index);
    }
  };

  const containerStyle = { ...mapContainerStyle, height };

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {/* Render markers */}
        {markers.map((marker, index) => (
          <div key={index}>
            <Marker
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handleMarkerClick(marker, index)}
              title={marker.title}
              icon={marker.icon || undefined}
            />
            {selectedMarker === index && (
              <InfoWindow
                position={{ lat: marker.lat, lng: marker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-bold text-sm">{marker.title}</h3>
                  {marker.description && (
                    <p className="text-xs text-gray-600 mt-1">{marker.description}</p>
                  )}
                  {marker.location && (
                    <p className="text-xs text-gray-500 mt-1">{marker.location}</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </div>
        ))}

        {/* Render directions if provided */}
        {showDirections && directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                zIndex: 50,
                strokeColor: '#f97316',
                strokeWeight: 4,
              },
            }}
          />
        )}
      </GoogleMap>
  );
};

export default GoogleMapComponent;
