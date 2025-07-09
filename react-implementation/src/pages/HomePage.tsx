import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import PropertyList from '../components/PropertyList';
import { Property } from '../types/property';
import { searchProperties } from '../services/api';

const HomePage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchProperties(query);
      setProperties(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            mybnb
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Find your perfect furnished apartment for short-term and long-term stays
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Results */}
        {hasSearched && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {isLoading ? 'Searching...' : `${properties.length} properties found`}
              </h2>
              <p className="text-slate-400">
                Discover amazing places to stay in Germany
              </p>
            </div>
            <PropertyList properties={properties} isLoading={isLoading} />
          </div>
        )}

        {/* Welcome message when no search has been performed */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-lg mb-4">
              Start your search to discover amazing properties
            </div>
            <div className="text-slate-500 text-sm">
              Enter your search terms above
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;