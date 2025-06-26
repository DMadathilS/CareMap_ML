import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { LiveIndicator } from './LiveIndicator';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow';
  showLiveIndicator?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  showLiveIndicator = false
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500'
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {showLiveIndicator && (
          <div className="ml-4">
            <LiveIndicator size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};