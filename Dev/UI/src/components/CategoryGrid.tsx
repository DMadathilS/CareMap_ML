import React from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { HealthcareCategory } from '../types';
import { CategoryCard } from './CategoryCard';

interface CategoryGridProps {
  categories: HealthcareCategory[];
//   onCategoryClick: (category: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories
    // , onCategoryClick
 }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'name' | 'count'>('count');

  // Filter and sort categories
  const filteredAndSortedCategories = categories
    .filter(category => 
      category.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'count') {
        return b.count - a.count;
      } else {
        return a.category.localeCompare(b.category);
      }
    });

  const totalProviders = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Healthcare Provider Categories</h2>
            <p className="text-gray-600">
              Browse {categories.length} categories with {totalProviders.toLocaleString()} total providers
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search healthcare categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'count')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="count">Sort by Count</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {searchTerm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Found {filteredAndSortedCategories.length} categories matching "{searchTerm}"
          </p>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedCategories.map((category, index) => (
          <CategoryCard
            key={index}
            category={category}
            // onClick={onCategoryClick}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedCategories.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">
            Try adjusting your search term or browse all categories.
          </p>
        </div>
      )}
    </div>
  );
};