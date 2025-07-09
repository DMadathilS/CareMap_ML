import React from 'react';
import { 
  Stethoscope, 
  Pill, 
  Heart, 
  Brain, 
  Eye, 
  Zap, 
  Users, 
  TestTube, 
  Activity,
  Glasses,
  Leaf,
  Target,
  Ear,
  GraduationCap,
  Smile,
  ShoppingBag,
  Footprints,
  MessageSquare,
  Dumbbell,
  Home,
  Sparkles
} from 'lucide-react';
import { HealthcareCategory } from '../types';

interface CategoryCardProps {
  category: HealthcareCategory;
//   onClick: (category: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, 
    // onClick 
}) => {
  // Get icon and color based on category
  const getCategoryInfo = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('physiotherapist')) {
      return { icon: Activity, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconColor: 'text-blue-600' };
    } else if (name.includes('dentist') || name.includes('dental')) {
      return { icon: Smile, color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', iconColor: 'text-green-600' };
    } else if (name.includes('massage')) {
      return { icon: Heart, color: 'pink', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', iconColor: 'text-pink-600' };
    } else if (name.includes('chiropractor')) {
      return { icon: Zap, color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', iconColor: 'text-yellow-600' };
    } else if (name.includes('pharmacy')) {
      return { icon: Pill, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', iconColor: 'text-red-600' };
    } else if (name.includes('optometrist')) {
      return { icon: Eye, color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', iconColor: 'text-purple-600' };
    } else if (name.includes('social worker')) {
      return { icon: Users, color: 'indigo', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', iconColor: 'text-indigo-600' };
    } else if (name.includes('psychotherapist') || name.includes('psychologist')) {
      return { icon: Brain, color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', iconColor: 'text-teal-600' };
    } else if (name.includes('optical')) {
      return { icon: Glasses, color: 'cyan', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', iconColor: 'text-cyan-600' };
    } else if (name.includes('naturopath') || name.includes('homeopath')) {
      return { icon: Leaf, color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', iconColor: 'text-emerald-600' };
    } else if (name.includes('acupuncture')) {
      return { icon: Target, color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', iconColor: 'text-orange-600' };
    } else if (name.includes('osteopath')) {
      return { icon: Zap, color: 'lime', bgColor: 'bg-lime-50', borderColor: 'border-lime-200', iconColor: 'text-lime-600' };
    } else if (name.includes('audio') || name.includes('audiologist')) {
      return { icon: Ear, color: 'violet', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', iconColor: 'text-violet-600' };
    } else if (name.includes('master of social work')) {
      return { icon: GraduationCap, color: 'slate', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', iconColor: 'text-slate-600' };
    } else if (name.includes('orthodontist')) {
      return { icon: Smile, color: 'rose', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', iconColor: 'text-rose-600' };
    } else if (name.includes('medical items')) {
      return { icon: ShoppingBag, color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', iconColor: 'text-amber-600' };
    } else if (name.includes('chiropodist') || name.includes('podiatrist')) {
      return { icon: Footprints, color: 'stone', bgColor: 'bg-stone-50', borderColor: 'border-stone-200', iconColor: 'text-stone-600' };
    } else if (name.includes('occupational therapist')) {
      return { icon: Activity, color: 'sky', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', iconColor: 'text-sky-600' };
    } else if (name.includes('lab') || name.includes('diagnostic')) {
      return { icon: TestTube, color: 'fuchsia', bgColor: 'bg-fuchsia-50', borderColor: 'border-fuchsia-200', iconColor: 'text-fuchsia-600' };
    } else if (name.includes('speech')) {
      return { icon: MessageSquare, color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', iconColor: 'text-emerald-600' };
    } else if (name.includes('dietitian')) {
      return { icon: Leaf, color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', iconColor: 'text-green-600' };
    } else if (name.includes('athletic')) {
      return { icon: Dumbbell, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', iconColor: 'text-red-600' };
    } else if (name.includes('hospital')) {
      return { icon: Home, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconColor: 'text-blue-600' };
    } else if (name.includes('clinical counsellor')) {
      return { icon: MessageSquare, color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', iconColor: 'text-purple-600' };
    } else {
      return { icon: Stethoscope, color: 'gray', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', iconColor: 'text-gray-600' };
    }
  };

  const categoryInfo = getCategoryInfo(category.category);
  const Icon = categoryInfo.icon;

  // Format category name for display
  const formatCategoryName = (name: string) => {
    return name.replace(/\(.*?\)/g, '').trim();
  };

  return (
    <div
    //   onClick={() => onClick(category.category)}
      className={`${categoryInfo.bgColor} ${categoryInfo.borderColor} border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow`}>
          <Icon className={`w-6 h-6 ${categoryInfo.iconColor}`} />
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${categoryInfo.iconColor}`}>
            {category.count}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Available
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-gray-700 transition-colors">
          {formatCategoryName(category.category)}
        </h3>
        <p className="text-sm text-gray-600">
          Find nearby {formatCategoryName(category.category).toLowerCase()}s
        </p>
      </div>
      
      {/* Hover indicator */}
      <div className="mt-4 flex items-center text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
        <span>Click to view on map</span>
        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};