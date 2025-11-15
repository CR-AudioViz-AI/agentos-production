'use client'

import { useState } from 'react'

export default function SearchPage() {
  const [filters, setFilters] = useState({
    type: 'all',
    mode: 'all',
    minPrice: '',
    maxPrice: '',
    city: '',
  })

  const mockProperties = [
    {
      id: 1,
      title: 'Beautiful 3BR Home in Naples',
      type: 'residential',
      mode: 'buy',
      price: 450000,
      city: 'Naples',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
    },
    {
      id: 2,
      title: 'Luxury Waterfront Condo',
      type: 'residential',
      mode: 'rent',
      price: 3500,
      city: 'Bonita Springs',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1400,
    },
    {
      id: 3,
      title: 'Retail Space - Downtown Fort Myers',
      type: 'commercial',
      mode: 'buy',
      price: 850000,
      city: 'Fort Myers',
      sqft: 3200,
    },
    {
      id: 4,
      title: 'Office Building - Prime Location',
      type: 'commercial',
      mode: 'rent',
      price: 8500,
      city: 'Naples',
      sqft: 4500,
    },
    {
      id: 5,
      title: 'Warehouse - Lehigh Acres',
      type: 'industrial',
      mode: 'buy',
      price: 1200000,
      city: 'Lehigh Acres',
      sqft: 12000,
    },
    {
      id: 6,
      title: 'Manufacturing Facility',
      type: 'industrial',
      mode: 'rent',
      price: 15000,
      city: 'Fort Myers',
      sqft: 18000,
    },
  ]

  const filteredProperties = mockProperties.filter(prop => {
    if (filters.type !== 'all' && prop.type !== filters.type) return false
    if (filters.mode !== 'all' && prop.mode !== filters.mode) return false
    if (filters.city && !prop.city.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.minPrice && prop.price < parseInt(filters.minPrice)) return false
    if (filters.maxPrice && prop.price > parseInt(filters.maxPrice)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Property Search</h1>
          <p className="mt-2 text-lg">Find your perfect property in Southwest Florida</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Property Type</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="all">All Types</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Buy or Rent</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    value={filters.mode}
                    onChange={(e) => setFilters({...filters, mode: e.target.value})}
                  >
                    <option value="all">All</option>
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Price</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2"
                    placeholder="$0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Price</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2"
                    placeholder="Any"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-lg p-2"
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                  />
                </div>

                <button 
                  onClick={() => setFilters({type: 'all', mode: 'all', minPrice: '', maxPrice: '', city: ''})}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Property Listings */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <p className="text-gray-600">
                <span className="font-semibold">{filteredProperties.length}</span> properties found
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                  <div className="h-48 bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-6xl">
                    {property.type === 'residential' && '🏡'}
                    {property.type === 'commercial' && '🏢'}
                    {property.type === 'industrial' && '🏭'}
                  </div>
                  <div className="p-6">
                    <div className="flex gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        property.type === 'residential' ? 'bg-blue-100 text-blue-700' :
                        property.type === 'commercial' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        property.mode === 'buy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        For {property.mode === 'buy' ? 'Sale' : 'Rent'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                    <p className="text-2xl text-blue-600 font-bold mb-2">
                      ${property.price.toLocaleString()}{property.mode === 'rent' && '/mo'}
                    </p>
                    <p className="text-gray-600 mb-4">📍 {property.city}</p>
                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                      {property.bedrooms && <span>🛏️ {property.bedrooms} beds</span>}
                      {property.bathrooms && <span>🛁 {property.bathrooms} baths</span>}
                      <span>📐 {property.sqft.toLocaleString()} sqft</span>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">No properties match your filters.</p>
                <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
