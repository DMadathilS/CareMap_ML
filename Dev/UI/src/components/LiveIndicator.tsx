import React from 'react';

interface LiveIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} bg-green-500 rounded-full animate-pulse`}></div>
      <span className="text-sm text-green-600 font-medium">Live</span>
    </div>
  );
};