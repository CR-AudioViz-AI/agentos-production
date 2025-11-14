'use client';

import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  DollarSign,
  Filter,
  Heart,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

export default function CustomerPortal() {
  const [selectedMarket, setSelectedMarket] = useState('All Markets');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [beds, setBeds] = useState('any');
  const [propertyType, setPropertyType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const floridaMarkets = [
    'All Markets',
    'Miami', 'Tampa', 'Orlando', 'Jacksonville',
    'Fort Myers', 'Tallahassee', 'Naples', 'Sarasota'
  ];

  const properties = [
    { id: 1, address: '123 Ocean Dr', city: 'Miami', price: 1250000, beds: 3, baths: 2, sqft: 2100, type: 'Condo', image: 'miami-beach' },
    { id: 2, address: '456 Bay St', city: 'Tampa', price: 850000, beds: 4, baths: 3, sqft: 2800, type: 'Single Family', image: 'tampa-bay' },
    { id: 3, address: '789 Palm Ave', city: 'Fort Myers', price: 625000, beds: 3, baths: 2.5, sqft: 2200, type: 'Single Family', image: 'fort-myers' },
    { id: 4, address: '321 Sunset Blvd', city: 'Naples', price: 1850000, beds: 5, baths: 4, sqft: 3500, type: 'Estate', image: 'naples-sunset' },
    { id: 5, address: '654 Marina Way', city: 'Sarasota', price: 975000, beds: 4, baths: 3, sqft: 2600, type: 'Waterfront', image: 'sarasota-marina' },
    { id: 6, address: '987 Gulf Shore', city: 'Fort Myers', price: 725000, beds: 3, baths: 2, sqft: 1900, type: 'Condo', image: 'fort-myers-beach' },
    { id: 7, address: '159 Lake View Dr', city: 'Orlando', price: 495000, beds: 3, baths: 2, sqft: 1800, type: 'Townhouse', image: 'orlando-lake' },
    { id: 8, address: '753 Park Ave', city: 'Jacksonville', price: 385000, beds: 3, baths: 2, sqft: 1650, type: 'Single Family', image: 'jacksonville' },
    { id: 9, address: '246 Historic Ln', city: 'Tallahassee', price: 425000, beds: 4, baths: 2.5, sqft: 2100, type: 'Single Family', image: 'tallahassee' }
  ];

  const filteredProperties = properties.filter(prop => {
    if (selectedMarket !== 'All Markets' && prop.city !== selectedMarket) return false;
    if (prop.price < priceRange[0] || prop.price > priceRange[1]) return false;
    if (beds !== 'any' && prop.beds < parseInt(beds)) return false;
    if (propertyType !== 'all' && prop.type.toLowerCase() !== propertyType.toLowerCase()) return false;
    if (searchQuery && !prop.address.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !prop.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Home</h1>
              <p className="text-sm text-gray-600 mt-1">Explore properties across Florida</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Saved (0)</span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                Schedule Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by address or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Market Select */}
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {floridaMarkets.map((market) => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>

            {/* Bedrooms */}
            <select
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="any">Any Beds</option>
              <option value="1">1+ Beds</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>

            {/* Property Type */}
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="single family">Single Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="estate">Estate</option>
              <option value="waterfront">Waterfront</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Price Range</label>
              <span className="text-sm font-semibold text-gray-900">
                ${(priceRange[0] / 1000).toFixed(0)}K - ${(priceRange[1] / 1000000).toFixed(1)}M
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5000000"
              step="50000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredProperties.length}</span> of {properties.length} properties
            </p>
            <button 
              onClick={() => {
                setSelectedMarket('All Markets');
                setPriceRange([0, 5000000]);
                setBeds('any');
                setPropertyType('all');
                setSearchQuery('');
              }}
              className="text-sm text-green-600 font-semibold hover:text-green-700"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
              {/* Property Image */}
              <div className="relative h-56 bg-gradient-to-br from-green-400 to-emerald-500 overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                  <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition">
                    <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-900 shadow-lg">
                    {property.type}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5">
                <div className="mb-3">
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    ${(property.price / 1000000).toFixed(2)}M
                  </p>
                  <p className="font-semibold text-gray-900">{property.address}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {property.city}, FL
                  </p>
                </div>

                {/* Stats */}
                <div className="flex justify-between py-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Bed className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.beds} beds</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Bath className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.baths} baths</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Square className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No properties match your criteria</p>
            <button 
              onClick={() => {
                setSelectedMarket('All Markets');
                setPriceRange([0, 5000000]);
                setBeds('any');
                setPropertyType('all');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Contact Agent Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-gray-600 mb-6">
            Connect with our expert agents serving all 8 Florida markets
          </p>
          <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
              <Phone className="w-5 h-5" />
              Call Agent
            </button>
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
              <Mail className="w-5 h-5" />
              Email Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
