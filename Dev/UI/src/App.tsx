import React, { useEffect, useRef, useState } from 'react';
import { Clock, Users, Bed, AlertTriangle, Activity, Heart, BarChart3 } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { Chatbot } from './components/Chatbot';
import { CompactChatbot } from './components/CompactChatbot';
import { WaitTimeGraph } from './components/WaitTimeGraph';
import { LiveIndicator } from './components/LiveIndicator';
import { hospitalStats } from './data/mockData';
import { useRealTimeStats } from './hooks/useRealTimeStats';
import { ClinicResults } from './components/ClinicResults';
import { Clinic,CategoryStat } from './types';
import {
  FaStethoscope,
  FaUserMd,
  FaHandPaper,
  FaSpa,
  FaPills,
  FaGlasses,
  FaHandsHelping,
  FaLeaf,
  FaCrosshairs,
  FaBone,
  // FaEar,
  FaTooth,
  FaMedkit,
  FaShoePrints,
  FaBrain,
  FaWheelchair,
  FaCommentMedical,
  FaAppleAlt,
  FaRunning,
  FaHospital,
  FaVials,
    FaQuestionCircle, // for fallback

} from 'react-icons/fa';
import { FaEarListen } from 'react-icons/fa6';
function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  // const stats = useRealTimeStats(hospitalStats);
    const formatTime = (minutes: number) => {
    const roundedMinutes = Math.round(minutes);
    if (roundedMinutes >= 60) {
      const hours = Math.floor(roundedMinutes / 60);
      const mins = roundedMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${roundedMinutes}m`;
  };
  const [clinicData, setClinicData] = useState<Clinic[]>([]);
const [showClinicResults, setShowClinicResults] = useState(true);
const [stats, setStats] = useState({
  emergencyWaitTime: 0,
  patientCount: 0,
  overallAverageWaitNum : 0,
  overallAverageWaitText: "0",
  overallAveragePatients:0
});
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/CareMap/api/provider-category-stats")
      .then((res) => res.json())
      .then(setCategoryStats)
      .catch((err) => console.error("Failed to load stats", err));
  }, []);
const COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-red-100 text-red-800",
  "bg-pink-100 text-pink-800",
  "bg-orange-100 text-orange-800",
];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

const categoryIconMap: Record<string, React.ElementType> = {
  Physiotherapist: FaStethoscope,
  'General Practitioner/Dentist': FaUserMd,
  'Massage Therapist': FaHandPaper,
  Chiropractor: FaSpa,
  'Retail Pharmacy': FaPills,
  Optometrists: FaGlasses,
  'Social Worker': FaHandsHelping,
  Psychotherapist: FaHandsHelping,
  'Optical Provider': FaGlasses,
  Naturopath: FaLeaf,
  Acupuncture: FaCrosshairs,
  Osteopath: FaBone,
  Audio: FaEarListen,
  'Master of Social Work': FaHandsHelping,
  Orthodontist: FaTooth,
  'Medical Items w/o footwear': FaMedkit,
  Chiropodist: FaShoePrints,
  Psychologist: FaBrain,
  'Occupational Therapist': FaWheelchair,
  'Speech Therapist/Pathologist': FaCommentMedical,
  Dietitian: FaAppleAlt,
  Audiologist: FaEarListen,
  'Athletic Therapist': FaRunning,
  Podiatrist: FaShoePrints,
  'Hospital Dispensary': FaHospital,
  'Clinical Counsellor': FaHandsHelping,
  Homeopath: FaLeaf,
  'Lab / Diagnostic Provider': FaVials,
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CareMap</h1>
                <p className="text-sm text-gray-600">Smart Healthcare Guidance at Your Fingertips</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real-time Hospital Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant updates on wait times, and connect with our AI assistant 
            to find the best healthcare options near you.
          </p>
        </div>
 {/* Emergency Alert */}
        {stats.emergencyWaitTime > 60 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">High Emergency Wait Times</h3>
                <p className="text-red-700 text-sm mt-1">
                  Current avg wait time in KWC Region is {formatTime(stats.emergencyWaitTime)}. Consider visiting nearby urgent care centers or walk-in clinics for non-emergency issues.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-6 mb-12">
          <StatCard
            title="Emergency Wait Time"
            value={formatTime(stats.overallAverageWaitNum)}
            subtitle="Current estimated wait"
            icon={Clock}
            color="red"
            showLiveIndicator={true}
          />
          <StatCard
            title="Current Patients"
            value={stats.overallAveragePatients}
            subtitle="In hospital now"
            icon={Users}
            color="blue"
            showLiveIndicator={true}
          />
{/*     
          <StatCard
            title="Status"
            value="Operational"
            subtitle="All systems running"
            icon={Activity}
            color="green"
          /> */}
        </div>
 
        {/* Emergency Wait Time Comparison Graph */}
        <WaitTimeGraph
  onStatsUpdate={({ emergencyWaitTime,patientCount,overallAverageWaitNum, overallAverageWaitText,overallAveragePatients }) =>
    setStats({ emergencyWaitTime,patientCount,overallAverageWaitNum, overallAverageWaitText,overallAveragePatients })
  }
/>
<div className="my-10">
  {/* Heading and subtitle */}
  <div className="text-center mb-6">
    <h2 className="text-2xl font-bold text-gray-800">Available Healthcare Providers in KWC</h2>
    <p className="text-sm text-gray-600">Explore the diverse range of providers here to support your well-being.</p>
  </div>

  {/* Scrollable carousel */}
  <div className="overflow-x-auto scrollbar-hide" ref={scrollRef}>
    <div className="flex space-x-4 snap-x snap-mandatory w-max">
      {categoryStats.map((item, index) => {
        const color = COLORS[index % COLORS.length];
        const Icon = categoryIconMap[item.category] || FaQuestionCircle;

        return (
          <div
            key={index}
            className={`min-w-[220px] snap-center rounded-2xl p-6 shadow-lg ${color} flex flex-col items-center text-center transition-transform hover:scale-105`}
          >
            {/* Icon with soft background circle */}
            <div className=" p-3 rounded-md mb-4">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>

            <p className="text-3xl font-bold text-gray-800">{item.count}</p>
            <p className="text-sm text-gray-500 mb-1">Providers</p>
            <h3 className="text-base font-semibold text-gray-700">{item.category}</h3>
          </div>
        );
      })}
    </div>
  </div>
</div>



       

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hospital Services</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">24/7 Emergency Department</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Specialist Consultations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Diagnostic Imaging</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Laboratory Services</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-700">Welcome to Your Personal Healthcare Assistant</h2>
            <p className="text-gray-600 mb-4">
              Our AI assistant can help you find nearby clinics, check wait times, and answer your healthcare questions.
            </p>
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Chat with Buddy
            </button>
          </div>
        </div>

       
      </main>

      {/* Main Chatbot (for clinic finding) */}
      <Chatbot 
  isOpen={isChatbotOpen} 
  onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
  setClinicData={setClinicData}
/>

{clinicData.length > 0 && showClinicResults && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
      
      {/* Close Button */}
      <button 
        onClick={() => setShowClinicResults(false)} 
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Nearby Clinics</h2>
      </div>

      {/* Clinic Results */}
      <ClinicResults 
        clinics={clinicData} 
        userLocation={{ lat: 43.4706, lng: -80.5462 }} 
      />
    </div>
  </div>
)}



   
    </div>
  );
}

export default App;