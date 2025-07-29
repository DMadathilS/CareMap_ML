import React, { useEffect, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { FaUserMd, FaHandPaper, FaSpa, FaPills, FaGlasses } from "react-icons/fa";
import { FaEarListen } from "react-icons/fa6";
import ClinicResultsModal from "./ClinicResultsModal";


// import { fetchCategoryStats } from "../api/providers";
import { CategoryStat } from "../types";

import {  
  FaBrain,
  FaPeopleCarry,
  FaWheelchair,
  FaShoePrints,
  FaBone,
  FaCarrot,
  FaYinYang,
  FaHeartbeat,
} from "react-icons/fa";

const iconMap: Record<string, JSX.Element> = {
  "General Practitioner/Dentist": <FaUserMd className="text-blue-600 w-8 h-8" />,
  "Massage Therapist": <FaHandPaper className="text-blue-600 w-8 h-8" />,
  "Chiropractor": <FaSpa className="text-blue-600 w-8 h-8" />,
  "Chiropractor (includes medical items)": <FaSpa className="text-blue-600 w-8 h-8" />,
  "Retail Pharmacy": <FaPills className="text-blue-600 w-8 h-8" />,
  Optometrists: <FaGlasses className="text-blue-600 w-8 h-8" />,
  "Optical Provider": <FaGlasses className="text-blue-600 w-8 h-8" />,
  Audio: <FaEarListen className="text-blue-600 w-8 h-8" />,
  "Physiotherapist": <FaBrain className="text-blue-600 w-8 h-8" />,
  "Social Worker": <FaPeopleCarry className="text-blue-600 w-8 h-8" />,
  "Occupational Therapist": <FaWheelchair className="text-blue-600 w-8 h-8" />,
  Podiatrist: <FaShoePrints className="text-blue-600 w-8 h-8" />,
  Osteopath: <FaBone className="text-blue-600 w-8 h-8" />,
  Dietitian: <FaCarrot className="text-blue-600 w-8 h-8" />,
  Acupuncture: <FaYinYang className="text-blue-600 w-8 h-8" />,
  Naturopath: <FaHeartbeat className="text-blue-600 w-8 h-8" />,
};


export const ProviderDashboard: React.FC = () => {
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const fetchCategoryStats = async () => {
  const res = await fetch("http://localhost:8000/CareMap/api/provider-category-stats");
  if (!res.ok) throw new Error("Failed to fetch category stats");
  return await res.json();
};
  
const itemsPerPage = 6;
const [currentPage, setCurrentPage] = useState(0);
const totalPages = Math.ceil(categoryStats.length / itemsPerPage);

const handleNext = () => {
  if (currentPage < totalPages - 1) {
    setCurrentPage(currentPage + 1);
  }
};

const handlePrev = () => {
  if (currentPage > 0) {
    setCurrentPage(currentPage - 1);
  }
};


  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCategoryStats();
        setCategoryStats(data);
      } catch (err) {
        console.error("Error fetching provider categories", err);
      }
    };
    loadData();
  }, []);


  
  const handleCardClick = async (category: string) => {
  try {
    const response = await fetch(
      `http://localhost:8000/CareMap/api/providers/by-category?category=${encodeURIComponent(category)}`
    );
    const data = await response.json();

    // Check if the response is an array
    if (!Array.isArray(data)) {
      console.warn("API did not return an array:", data);
      setResults([]);  // Prevent the .map crash
      return;
    }

    setResults(data);
    setShowModal(true);
  } catch (err) {
    console.error("Error loading providers by category", err);
  }
};

 
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Available Healthcare Providers in KWC</h2>

      <input
        type="text"
        placeholder="Search for a provider type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6"
      />

    <div className="relative w-full mt-4">
  {/* Left Arrow */}
  {currentPage > 0 && (
    <button
      onClick={handlePrev}
      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border shadow-md hover:bg-blue-100 text-blue-600 p-3 rounded-full"
    >
      &laquo;
    </button>
  )}

  {/* Card Grid Carousel */}
  <div className="overflow-hidden w-full">
    <div
      className="flex transition-transform duration-500 ease-in-out"
      style={{
        transform: `translateX(-${currentPage * 15}%)`,
        width: `${totalPages * 15}%`,
      }}
    >
      {Array.from({ length: totalPages }).map((_, pageIndex) => {
        const start = pageIndex * itemsPerPage;
        const pageItems = categoryStats.slice(start, start + itemsPerPage);

        return (
          <div
            key={pageIndex}
            className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 flex-shrink-0"
            style={{ minWidth: '50%' }}
          >
            {pageItems.map((category, idx) => (
              <div
                key={idx}
                onClick={() => handleCardClick(category.category)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition transform hover:-translate-y-1 text-center cursor-pointer"
              >
                <div className="text-4xl text-blue-600 mb-4">
                  {iconMap[category.category] || <FaQuestionCircle />}
                </div>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {category.count}
                </p>
                <p className="text-sm text-gray-500">Providers</p>
                <h3 className="text-lg font-semibold text-gray-700 mt-2">
                  {category.category}
                </h3>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  </div>

  {/* Right Arrow */}
  {currentPage < totalPages - 1 && (
    <button
      onClick={handleNext}
      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border shadow-md hover:bg-blue-100 text-blue-600 p-3 rounded-full"
    >
      &raquo;
    </button>
  )}
</div>

      {/*<div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginatedStats.map((category, idx) => (
            <div
              key={idx}
              className="cursor-pointer bg-gray-100 rounded-xl p-6 hover:bg-blue-100 transition"
              onClick={() => handleCardClick(category.category)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-2">
                  {iconMap[category.category] || <FaQuestionCircle className="text-blue-600 w-8 h-8" />}
                </div>
                <p className="text-3xl font-bold text-gray-800">{category.count}</p>
                <p className="text-sm text-gray-500 mb-1">Providers</p>
                <h3 className="text-base font-semibold text-gray-700">{category.category}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center mt-6 space-x-6">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
    disabled={currentPage === 0}
    className={`flex items-center gap-1 px-5 py-2 rounded-lg transition 
      ${currentPage === 0 
        ? 'bg-blue-200 text-white cursor-not-allowed' 
        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}
  >
    ◀ Previous
  </button>

  <span className="text-lg font-medium text-gray-700">
    Page <span className="text-blue-700">{currentPage + 1}</span> of <span className="text-blue-700">{totalPages}</span>
  </span>

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
    disabled={currentPage >= totalPages - 1}
    className={`flex items-center gap-1 px-5 py-2 rounded-lg transition 
      ${currentPage >= totalPages - 1 
        ? 'bg-blue-200 text-white cursor-not-allowed' 
        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}
  >
    Next ▶
  </button>
</div>*/}

      {/* Modal for Provider List */}
      {showModal && (
        <ClinicResultsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          clinics={results}
          userLocation={null}
        />
      )}
    </div>
  );
};
export default ProviderDashboard;
