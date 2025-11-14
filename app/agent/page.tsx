'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Home, Building2, Factory, Plus, Search, Filter, DollarSign, Bed, Bath, Square, MapPin, Edit2, Trash2, Eye, LogOut } from 'lucide-react';

interface Property {
  id: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  list_price: number | null;
  rental_price_monthly: number | null;
  category: string;
  status: string;
  description: string;
  photos: string[];
}

type PropertyCategory = 'residential_sale' | 'residential_rental' | 'commercial_sale' | 'commercial_rental' | 'industrial_sale' | 'industrial_rental';

export default function AgentDashboard() {
  const [activeCategory, setActiveCategory] = useState<PropertyCategory>('residential_sale');
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserAndProperties();
  }, [activeCategory]);

  const loadUserAndProperties = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);

      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('category', activeCategory)
        .order('created_at', { ascending: false });

      setProperties(props || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    await supabase.from('properties').delete().eq('id', id);
    loadUserAndProperties();
  };

  const categories = [
    { id: 'residential_sale' as const, label: 'Buy Home', icon: Home, color: 'blue' },
    { id: 'residential_rental' as const, label: 'Rent Home', icon: Home, color: 'green' },
    { id: 'commercial_sale' as const, label: 'Buy Commercial', icon: Building2, color: 'purple' },
    { id: 'commercial_rental' as const, label: 'Rent Commercial', icon: Building2, color: 'cyan' },
    { id: 'industrial_sale' as const, label: 'Buy Industrial', icon: Factory, color: 'orange' },
    { id: 'industrial_rental' as const, label: 'Rent Industrial', icon: Factory, color: 'red' },
  ];

  const filteredProperties = properties.filter(p =>
    p.address_street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tony & Laura Harvey</h1>
              <p className="text-sm text-gray-600">Premiere Plus Realty</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? `bg-${cat.color}-600 text-white`
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
                style={activeCategory === cat.id ? {
                  backgroundColor: cat.color === 'blue' ? '#2563eb' :
                    cat.color === 'green' ? '#16a34a' :
                    cat.color === 'purple' ? '#9333ea' :
                    cat.color === 'cyan' ? '#06b6d4' :
                    cat.color === 'orange' ? '#ea580c' : '#dc2626'
                } : {}}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Add */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAddProperty(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </button>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={() => deleteProperty(property.id)}
                onEdit={() => {}}
              />
            ))}
          </div>
        )}

        {filteredProperties.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              {activeCategory.includes('residential') && <Home className="w-16 h-16 mx-auto" />}
              {activeCategory.includes('commercial') && <Building2 className="w-16 h-16 mx-auto" />}
              {activeCategory.includes('industrial') && <Factory className="w-16 h-16 mx-auto" />}
            </div>
            <p className="text-gray-600">No properties in this category yet</p>
            <button
              onClick={() => setShowAddProperty(true)}
              className="mt-4 text-blue-600 hover:underline"
            >
              Add your first property
            </button>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddProperty && (
        <AddPropertyModal
          category={activeCategory}
          onClose={() => setShowAddProperty(false)}
          onSuccess={loadUserAndProperties}
        />
      )}
    </div>
  );
}

function PropertyCard({ property, onDelete, onEdit }: { property: Property; onDelete: () => void; onEdit: () => void }) {
  const isRental = property.category.includes('rental');
  const price = isRental ? property.rental_price_monthly : property.list_price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      {/* Image placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
        {property.category.includes('residential') && <Home className="w-12 h-12 text-blue-600" />}
        {property.category.includes('commercial') && <Building2 className="w-12 h-12 text-purple-600" />}
        {property.category.includes('industrial') && <Factory className="w-12 h-12 text-orange-600" />}
      </div>

      <div className="p-4">
        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-2">
          ${price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {isRental && <span className="text-sm font-normal text-gray-600">/month</span>}
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-gray-700 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
          <div>
            <div className="font-medium">{property.address_street}</div>
            <div className="text-sm">{property.address_city}, FL {property.address_zip}</div>
          </div>
        </div>

        {/* Details */}
        {property.bedrooms > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {property.bedrooms} bed
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {property.bathrooms} bath
            </div>
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              {property.square_feet.toLocaleString()} sqft
            </div>
          </div>
        )}

        {property.square_feet > 0 && property.bedrooms === 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <Square className="w-4 h-4" />
            {property.square_feet.toLocaleString()} sqft
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.description}</p>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 text-xs rounded-full ${
            property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {property.status}
          </span>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddPropertyModal({ category, onClose, onSuccess }: { category: PropertyCategory; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    address_street: '',
    address_city: 'Naples',
    address_zip: '',
    property_type: 'single_family',
    bedrooms: 0,
    bathrooms: 0,
    square_feet: 0,
    price: '',
    description: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const isRental = category.includes('rental');
  const isResidential = category.includes('residential');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const propertyData: any = {
        organization_id: profile?.organization_id || '00000000-0000-0000-0000-000000000001',
        agent_id: user?.id,
        address_street: formData.address_street,
        address_city: formData.address_city,
        address_zip: formData.address_zip,
        address_state: 'FL',
        property_type: formData.property_type,
        square_feet: parseInt(formData.square_feet.toString()),
        category,
        status: formData.status,
        description: formData.description
      };

      if (isResidential) {
        propertyData.bedrooms = parseInt(formData.bedrooms.toString());
        propertyData.bathrooms = parseFloat(formData.bathrooms.toString());
      }

      if (isRental) {
        propertyData.rental_price_monthly = parseFloat(formData.price);
      } else {
        propertyData.list_price = parseFloat(formData.price);
      }

      const { error } = await supabase.from('properties').insert(propertyData);
      if (error) throw error;

      alert('Property added!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Add Property - {category.replace(/_/g, ' ').toUpperCase()}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Street Address"
                value={formData.address_street}
                onChange={(e) => setFormData({...formData, address_street: e.target.value})}
                required
                className="col-span-2 px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.address_city}
                onChange={(e) => setFormData({...formData, address_city: e.target.value})}
                required
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={formData.address_zip}
                onChange={(e) => setFormData({...formData, address_zip: e.target.value})}
                required
                className="px-4 py-2 border rounded-lg"
              />
            </div>

            {isResidential && (
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Bedrooms"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Bathrooms"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({...formData, bathrooms: parseFloat(e.target.value)})}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Sq Ft"
                  value={formData.square_feet}
                  onChange={(e) => setFormData({...formData, square_feet: parseInt(e.target.value)})}
                  required
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
            )}

            {!isResidential && (
              <input
                type="number"
                placeholder="Square Feet"
                value={formData.square_feet}
                onChange={(e) => setFormData({...formData, square_feet: parseInt(e.target.value)})}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            )}

            <input
              type="number"
              step="0.01"
              placeholder={isRental ? "Monthly Rent ($)" : "Sale Price ($)"}
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Property'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
