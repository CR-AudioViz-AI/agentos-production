// ============================================================
// AGENTOS - REUSABLE PROPERTY MANAGER COMPONENT
// Handles all 7 property types with shared logic
// ============================================================
// TIMESTAMP: Saturday, November 15, 2025 - 1:45 PM EST
// LOCATION: app/components/PropertyManager.tsx

'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, Edit2, Trash2, Eye, MapPin, DollarSign, Home, Building2 } from 'lucide-react';

interface PropertyManagerProps {
  category: 'residential' | 'commercial' | 'industrial' | 'rental' | 'land' | 'vacation' | 'investment';
  title: string;
  description: string;
}

interface Property {
  id: string;
  category: string;
  property_type: string;
  status: string;
  mls_number: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  list_price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
  description: string;
  images: string[];
  created_at: string;
}

export default function PropertyManager({ category, title, description }: PropertyManagerProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, [category, statusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let url = `/api/properties?category=${category}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/properties?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        fetchProperties();
      } else {
        alert(data.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property');
    }
  };

  const filteredProperties = properties.filter(prop => {
    const searchLower = searchTerm.toLowerCase();
    return (
      prop.address_line1.toLowerCase().includes(searchLower) ||
      prop.address_city.toLowerCase().includes(searchLower) ||
      prop.address_zip.includes(searchTerm) ||
      (prop.mls_number && prop.mls_number.toLowerCase().includes(searchLower))
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-blue-100 text-blue-800',
      under_contract: 'bg-purple-100 text-purple-800',
      off_market: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1C2833' }}>{title}</h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: '#5EA8A7' }}
            >
              <PlusCircle className="w-5 h-5" />
              Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by address, city, ZIP, or MLS#..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
              
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="under_contract">Under Contract</option>
              <option value="sold">Sold</option>
              <option value="off_market">Off Market</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Properties</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>{properties.length}</p>
              </div>
              <Building2 className="w-8 h-8" style={{ color: '#5EA8A7' }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Listings</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>
                  {properties.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Home className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Under Contract</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>
                  {properties.filter(p => p.status === 'under_contract').length}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Value</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>
                  {formatPrice(properties.reduce((sum, p) => sum + (p.list_price || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8" style={{ color: '#FE4447' }} />
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#5EA8A7' }}></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mt-6">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Add your first property to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Property Image */}
                <div className="h-48 bg-gray-200 relative">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.address_line1}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(property.status)}`}
                  >
                    {property.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold" style={{ color: '#1C2833' }}>
                      {formatPrice(property.list_price)}
                    </h3>
                    {property.mls_number && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        MLS# {property.mls_number}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {property.address_line1}, {property.address_city}, {property.address_state} {property.address_zip}
                    </span>
                  </div>

                  {/* Property Stats */}
                  {(property.bedrooms || property.bathrooms || property.square_feet) && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          <strong>{property.bedrooms}</strong> bed
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          <strong>{property.bathrooms}</strong> bath
                        </span>
                      )}
                      {property.square_feet && (
                        <span className="flex items-center gap-1">
                          <strong>{property.square_feet.toLocaleString()}</strong> sqft
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedProperty(property)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowAddModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors"
                      style={{ borderColor: '#5EA8A7', color: '#5EA8A7' }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold" style={{ color: '#1C2833' }}>
                {selectedProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Property form will be implemented here</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedProperty(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white font-semibold transition-colors"
                style={{ backgroundColor: '#5EA8A7' }}
              >
                Save Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
