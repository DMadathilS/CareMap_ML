import React from "react";
import { FaPhoneAlt, FaGlobe, FaMapMarkerAlt } from "react-icons/fa";
import { Provider } from "../types";

interface ProviderModalProps {
  providers: Provider[];
  onClose: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ providers, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nearby Providers</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-xl border shadow-md p-6 bg-white hover:shadow-lg transition"
            >
              {/* Badge */}
              <div className="mb-2">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                  Recommended
                </span>
              </div>

              {/* Name */}
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {provider.provider_name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3">
                {provider.description}
              </p>

              {/* Address */}
              <div className="text-sm text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2 text-blue-600" />
                {provider.address}
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-1 text-sm text-gray-700">
                <div>
                  <FaPhoneAlt className="inline mr-2 text-blue-600" />
                  {provider.phone_number}
                </div>
                {provider.website && (
                  <div>
                    <FaGlobe className="inline mr-2 text-blue-600" />
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Google Maps iframe */}
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="200"
                  className="rounded-md"
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    provider.address
                  )}&output=embed`}
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;
