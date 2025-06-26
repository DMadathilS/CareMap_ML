import { useState, useEffect } from 'react';
import { HospitalStats } from '../types';

export const useRealTimeStats = (initialStats: HospitalStats) => {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => ({
        ...prevStats,
        emergencyWaitTime: Math.max(15, prevStats.emergencyWaitTime + Math.floor(Math.random() * 10) - 5),
        patientCount: Math.max(50, prevStats.patientCount + Math.floor(Math.random() * 6) - 3),
        bedsAvailable: Math.max(0, Math.min(50, prevStats.bedsAvailable + Math.floor(Math.random() * 4) - 2)),
        lastUpdated: new Date().toLocaleTimeString(),
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return stats;
};