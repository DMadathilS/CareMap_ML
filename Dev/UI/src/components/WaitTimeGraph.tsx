import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HospitalWaitData {
  name: string;
  currentWait: number;
  averageWait: number;
  current_patients:number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  bgColor: string;
  borderColor: string;
}
interface WaitTimeGraphProps {
  onStatsUpdate?: (stats: {
    emergencyWaitTime:number;
    patientCount: number,
    overallAverageWaitNum:number;
    overallAverageWaitText: string;
    overallAveragePatients: number;

  }) => void;
}

export const WaitTimeGraph: React.FC<WaitTimeGraphProps> = ({ onStatsUpdate }) => {
  const [hospitalData, setHospitalData] = useState<HospitalWaitData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [hoveredHospital, setHoveredHospital] = useState<string | null>(null);

  const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500'];
  const BORDER_COLORS = ['border-blue-200', 'border-green-200', 'border-amber-200', 'border-purple-200'];

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/CareMap/api/stats');
      const data = await res.json();
      const hospitals = data.hospitals;

      const nameCounts: Record<string, number> = {};
      const transformedData: HospitalWaitData[] = Object.entries(hospitals).map(([name, values]: any, index) => {
        const baseName = name.replace(/['"]/g, '').trim();
        nameCounts[baseName] = (nameCounts[baseName] || 0) + 1;
        const uniqueName = nameCounts[baseName] > 1 ? `${baseName} (${nameCounts[baseName]})` : baseName;
        
        return {
          name: uniqueName,
          currentWait: values.currentWait,
          averageWait: values.averageWait,
          current_patients: values.current_patients, // 👈 Fix: Provide actual value here
          trend: values.trend,
          color: '#000',
          bgColor: COLORS[index % COLORS.length],
          borderColor: BORDER_COLORS[index % BORDER_COLORS.length]
        };
      });
// Compute average current wait and average current patients
const totalCurrentWait = transformedData.reduce((sum, h) => sum + h.currentWait, 0);
const totalCurrentPatients = transformedData.reduce((sum, h) => sum + h.current_patients, 0);
const hospitalCount = transformedData.length;

const avgCurrentWait = hospitalCount > 0 ? totalCurrentWait / hospitalCount : 0;
const avgCurrentPatients = hospitalCount > 0 ? totalCurrentPatients / hospitalCount : 0;
console.log(formatTime(avgCurrentWait),avgCurrentPatients);

      setHospitalData(transformedData);
      setLastUpdated(new Date().toLocaleTimeString());
      
  const totalPatients = transformedData.length;
  const emergencyWaitTime = Math.max(...transformedData.map(h => h.currentWait), 0);
    if (onStatsUpdate) {
  onStatsUpdate({
    emergencyWaitTime,
    patientCount: totalPatients,
    overallAverageWaitNum:avgCurrentWait,
    overallAverageWaitText: formatTime(avgCurrentWait),           // ✅ formatted
    overallAveragePatients: Math.round(avgCurrentPatients)   // ✅ rounded
  });
}


    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const maxWait = Math.max(...hospitalData.map(h => Math.max(h.currentWait, h.averageWait, 0))) + 10;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (minutes: number) => {
    const roundedMinutes = Math.round(minutes);
    if (roundedMinutes >= 60) {
      const hours = Math.floor(roundedMinutes / 60);
      const mins = roundedMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${roundedMinutes}m`;
  };

  return (
    <div className="bg-white rounded-xl w-auto h-auto shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-gray-900">Emergency Department Wait Times</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Live Data</span>
          {lastUpdated && (
            <span className="text-xs text-gray-500 ml-2">Last updated at {lastUpdated}</span>
          )}
        </div>
      </div>

      {/* Y-axis Labels */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0  flex flex-col justify-between text-xs text-gray-500 py-4">
          <span>{formatTime(maxWait)}</span>
          <span>{formatTime(Math.floor(maxWait * 0.75))}</span>
          <span>{formatTime(Math.floor(maxWait * 0.5))}</span>
          <span>{formatTime(Math.floor(maxWait * 0.25))}</span>
          <span>0m</span>
        </div>

        {/* Graph Bars */}
        <div className="ml-16 mt-52 relative">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="border-t border-gray-100"></div>
            ))}
          </div>

          <div className="flex items-end justify-between gap-8 h-64 pt-4 pb-4 relative">
            {hospitalData.map((hospital, index) => (
              <div
                key={hospital.name}
                className="flex-1 flex flex-col items-center gap-2 relative"
                onMouseEnter={() => setHoveredHospital(hospital.name)}
                onMouseLeave={() => setHoveredHospital(null)}
              >
                {/* Tooltip */}
                {hoveredHospital === hospital.name && (
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm z-10 whitespace-nowrap">
                    <div className="font-semibold">{hospital.name}</div>
                    <div>Current: {formatTime(hospital.currentWait)}</div>
                    <div>Average: {formatTime(hospital.averageWait)}</div>
                    <div>Current Patients: {hospital.current_patients}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}

                {/* Bar */}
                <div className="relative w-full flex justify-center">
                  <div
                    className={`w-16 ${hospital.bgColor} rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer`}
                    style={{ height: `${(hospital.currentWait / maxWait) * 240}px` }}
                  >
                    <div
                      className={`absolute ${
                        (hospital.currentWait / maxWait) * 240 < 30 ? 'top-full mt-1' : '-top-8'
                      } left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-900 whitespace-nowrap`}
                    >
                      {formatTime(hospital.currentWait)}
                    </div>
                  </div>
                </div>

                {/* Average Wait Line */}
           <div className="w-full relative -mt-2">
  <div
    className="absolute left-1/2 transform -translate-x-1/2 w-20 border-t-2 border-dotted border-slate-500"
    style={{ bottom: `${(hospital.averageWait / maxWait) * 240}px` }}
  >
    <div className="absolute right-0 -top-5 pr-1 text-xs text-slate-800 whitespace-nowrap">
      Avg: {formatTime(hospital.averageWait)}
    </div>
  </div>
</div>

                {/* Hospital Name and Trend */}
                <div className="text-center mt-4">
                  <div className="font-medium text-gray-900 text-sm mb-2 text-center px-1">{hospital.name}</div>
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(hospital.trend)}
                    <span className="text-xs text-gray-600 capitalize">{hospital.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700">Current Wait Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1.5 bg-gray-400 rounded"></div>
            <span className="text-gray-700">Average Wait Time</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-gray-700">Increasing</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">Decreasing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
