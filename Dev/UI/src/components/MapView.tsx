import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { MapPin, Navigation, Phone, Globe } from 'lucide-react';
import { Clinic } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  clinics: Clinic[];
  userLocation: { lat: number; lng: number };
  selectedClinic?: Clinic | null;
  onClinicSelect: (clinic: Clinic) => void;
}

// Custom component to fit bounds when clinics change
const MapController: React.FC<{ clinics: Clinic[]; userLocation: { lat: number; lng: number } }> = ({ 
  clinics, 
  userLocation 
}) => {
  const map = useMap();

  useEffect(() => {
    if (clinics.length > 0) {
      const bounds = new LatLngBounds([]);
      console.log(clinics);
      
      // Add user location to bounds
      bounds.extend([userLocation.lat, userLocation.lng]);
      
      // Add all clinic locations to bounds
      clinics.forEach(clinic => {
        bounds.extend([clinic.location.latitude, clinic.location.longitude]);
      });
      
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [clinics, userLocation, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({ 
  clinics, 
  userLocation, 
  selectedClinic,
  onClinicSelect 
}) => {
  const mapRef = useRef<any>(null);

  // Create custom icons
  // const userIcon = new Icon({
  //   iconUrl: 'data:image/svg+xml;base64,' + btoa(`
  //     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
  //       <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
  //       <circle cx="12" cy="12" r="6" fill="white"/>
  //       <circle cx="12" cy="12" r="2" fill="#3b82f6"/>
  //     </svg>
  //   `),
  //   iconSize: [24, 24],
  //   iconAnchor: [12, 12],
  // });

   const userIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946770.png',
  iconSize: [32, 32],          // You can adjust this size
  iconAnchor: [16, 32],        // Anchor the bottom center of the icon
});

  const clinicIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/14090/14090489.png',
  iconSize: [32, 32],          // You can adjust this size
  iconAnchor: [16, 32],        // Anchor the bottom center of the icon
});
const suggestedClinicIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/14035/14035451.png',
  iconSize: [32, 32],          // You can adjust this size
  iconAnchor: [16, 32],        // Anchor the bottom center of the icon
});


  const getDirections = (clinic: Clinic) => {
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${clinic.location.latitude},${clinic.location.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        ref={mapRef}
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController clinics={clinics} userLocation={userLocation} />
        
        {/* User location marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-blue-600">Your Location</div>
              <div className="text-sm text-gray-600">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Clinic markers */}
        {clinics.map((clinic) => (
          <Marker
            key={clinic.location_ID}
            position={[clinic.location.latitude, clinic.location.longitude]}
            icon={clinic.suggested ? suggestedClinicIcon : clinicIcon}
            eventHandlers={{
              click: () => onClinicSelect(clinic),
            }}
          >
            <Popup maxWidth={300}>
              <div className="p-2">
                {clinic.suggested && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                    Recommended
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-2">{clinic.name}</h3>
                
                {clinic.bot && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                    <p className="text-blue-800 text-sm">{clinic.bot}</p>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{clinic.address}</span>
                  </div>
                  
                  {clinic.contact_information.phone.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700">{clinic.contact_information.phone[0]}</span>
                    </div>
                  )}
                  
                  {clinic.contact_information.url && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <a 
                        href={clinic.contact_information.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => getDirections(clinic)}
                  className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};