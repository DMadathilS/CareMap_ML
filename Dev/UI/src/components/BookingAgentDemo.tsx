import React, { useState } from 'react';

const BookingAgentDemo: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="mt-10 flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">📞 Booking Agent Demo</h2>
      
      <button
        onClick={() => setShowPopup(true)}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Launch Booking Agent
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-xl max-w-sm">
            <h3 className="text-xl font-bold mb-2">Agent Alert</h3>
            <p className="mb-4">
              Agent will be calling on behalf of you to book an appointment.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingAgentDemo;
