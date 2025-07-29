import React from "react";
import { Clinic } from "@/types"; // ensure this interface exists with lat/lng, name, etc.
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ClinicResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinics: Clinic[];
  userLocation?: { lat: number; lng: number } | null;
}

const ClinicResultsModal: React.FC<ClinicResultsModalProps> = ({
  isOpen,
  onClose,
  clinics,
  userLocation,
}) => {
  if (!isOpen) return null;

  const defaultPosition = userLocation || { lat: 43.45, lng: -80.49 }; // Fallback: Waterloo
  console.log("Modal open?", isOpen);
  console.log("Clinic count:", clinics.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-900 text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Available Clinics
        </h2>

        <div className="grid gap-4">
          {clinics.map((clinic, index) => (
            <div key={index} className="p-4 border rounded-md shadow-sm">
              <h3 className="text-lg font-semibold">{clinic.provider_name}</h3>
              <p className="text-sm text-gray-600">{clinic.address}</p>
              <p className="text-sm text-green-600">
                {clinic.opening_hours?.status || "Availability info not available"}
              </p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="mt-6 h-[350px] rounded-md overflow-hidden">
          <MapContainer center={defaultPosition} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {clinics.map((clinic, index) => (
              <Marker
                key={index}
                position={[clinic.latitude, clinic.longitude]}
              >
                <Popup>
                  <strong>{clinic.provider_name}</strong><br />
                  {clinic.address}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default ClinicResultsModal;
