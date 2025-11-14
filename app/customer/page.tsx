// ============================================================
// AGENTOS - COMPLETE CUSTOMER PORTAL
// Property search with filters, favorites, inquiries, account
// ============================================================
// TIMESTAMP: Friday, November 14, 2025 - 11:59 PM EST

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('search');
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    city: 'all',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    minBathrooms: '',
    propertyType: 'all',
    search: ''
  });

  const cities = ['Naples', 'Fort Myers', 'Bonita Springs', 'Cape Coral', 'Estero', 'Marco Island', 'Sanibel', 'Fort Myers Beach'];
  const categories = [
    { value: 'residential_buy_sell', label: 'Residential Buy/Sell' },
    { value: 'residential_rentals', label: 'Residential Rentals' },
    { value: 'commercial_buy_sell', label: 'Commercial Buy/Sell' },
    { value: 'commercial_rentals', label: 'Commercial Rentals' },
    { value: 'industrial_buy_sell', label: 'Industrial Buy/Sell' },
    { value: 'industrial_rentals', label: 'Industrial Rentals' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, properties]);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    await loadProperties();
    if (user) {
      await loadFavorites(user.id);
    }
    setLoading(false);
  }

  async function loadProperties() {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setProperties(data || []);
  }

  async function loadFavorites(userId: string) {
    const { data } = await supabase
      .from('favorites')
      .select(`
        *,
        property:properties(*)
      `)
      .eq('user_id', userId);
    setFavorites(data || []);
  }

  function applyFilters() {
    let filtered = [...properties];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // City filter
    if (filters.city !== 'all') {
      filtered = filtered.filter(p => p.address_city === filters.city);
    }

    // Price range
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.list_price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.list_price <= parseFloat(filters.maxPrice));
    }

    // Bedrooms
    if (filters.minBedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.minBedrooms));
    }

    // Bathrooms
    if (filters.minBathrooms) {
      filtered = filtered.filter(p => p.bathrooms >= parseFloat(filters.minBathrooms));
    }

    // Property type
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(p => p.property_type === filters.propertyType);
    }

    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.address_line1?.toLowerCase().includes(search) ||
        p.address_city?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    setFilteredProperties(filtered);
  }

  async function toggleFavorite(propertyId: string) {
    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }

    const isFavorite = favorites.some(f => f.property_id === propertyId);

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
    } else {
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId
        });
    }

    loadFavorites(user.id);
  }

  async function submitInquiry(propertyId: string, message: string) {
    if (!user) {
      alert('Please sign in to send inquiries');
      return;
    }

    await supabase
      .from('property_inquiries')
      .insert({
        property_id: propertyId,
        customer_name: `${user.user_metadata?.first_name} ${user.user_metadata?.last_name}`,
        customer_email: user.email,
        customer_phone: user.user_metadata?.phone,
        inquiry_type: 'general',
        message: message,
        preferred_contact: 'email'
      });

    alert('Inquiry sent successfully!');
  }

  function resetFilters() {
    setFilters({
      category: 'all',
      city: 'all',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      minBathrooms: '',
      propertyType: 'all',
      search: ''
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Search</h1>
              <p className="text-sm text-gray-600">Find your dream home in Florida</p>
            </div>
            <div>
              {user ? (
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              ) : (
                <a
                  href="/login"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['search', 'favorites', 'account'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab}
                {tab === 'favorites' && favorites.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div>
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filter Properties</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Reset Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    placeholder="$0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    placeholder="Any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
                  <select
                    value={filters.minBedrooms}
                    onChange={(e) => setFilters({ ...filters, minBedrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Bathrooms</label>
                  <select
                    value={filters.minBathrooms}
                    onChange={(e) => setFilters({ ...filters, minBathrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Types</option>
                    <option value="single_family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi_family">Multi-Family</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Address, city..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredProperties.length} of {properties.length} properties
              </div>
            </div>

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
                    >
                      <svg
                        className={`w-6 h-6 ${favorites.some(f => f.property_id === property.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{property.address_line1}</h3>
                    <p className="text-sm text-gray-600">{property.address_city}, {property.address_state} {property.address_zip}</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      ${property.list_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="mt-2 flex justify-between text-sm text-gray-600">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.square_feet?.toLocaleString()} sqft</span>
                    </div>
                    {property.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {property.description}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          const message = `I'm interested in ${property.address_line1}. Please contact me with more information.`;
                          submitInquiry(property.id, message);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Contact Agent
                      </button>
                      <button
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No properties match your filters</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Saved Properties</h2>
            
            {!user ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Please sign in to see your saved properties</p>
                <a
                  href="/login"
                  className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Sign In
                </a>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">You haven't saved any properties yet</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                  const property = favorite.property;
                  return (
                    <div key={favorite.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{property.address_line1}</h3>
                        <p className="text-sm text-gray-600">{property.address_city}, {property.address_state}</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          ${property.list_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <button
                          onClick={() => toggleFavorite(property.id)}
                          className="mt-4 w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          Remove from Favorites
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Account</h2>
            
            {!user ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-600 mb-4">Please sign in to manage your account</p>
                <a
                  href="/login"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Sign In
                </a>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-gray-900">
                      {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
