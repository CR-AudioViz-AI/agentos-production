// ============================================================
// AGENTOS - CRM PAGE - FULL CONTACT MANAGEMENT  
// ============================================================
// TIMESTAMP: Saturday, November 15, 2025 - 1:47 PM EST

'use client';

import { useState, useEffect } from 'react';
import {
  Users, PlusCircle, Search, Filter, Mail, Phone, Calendar, 
  TrendingUp, Star, Clock, Eye, Edit2, Trash2, MessageSquare,
  Tag, MapPin, DollarSign, Home, Activity
} from 'lucide-react';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  temperature: string;
  lead_source: string;
  budget_min?: number;
  budget_max?: number;
  preferred_cities: string[];
  property_type: string[];
  created_at: string;
  assigned_agent?: {
    first_name: string;
    last_name: string;
  };
  activities?: any[];
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [temperatureFilter, setTemperatureFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, temperatureFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let url = '/api/leads?limit=200';
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (temperatureFilter !== 'all') url += `&temperature=${temperatureFilter}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        fetchLeads();
      } else {
        alert(data.error || 'Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.first_name.toLowerCase().includes(searchLower) ||
      lead.last_name.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower) ||
      (lead.phone && lead.phone.includes(searchTerm))
    );
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-green-100 text-green-800',
      showing_scheduled: 'bg-yellow-100 text-yellow-800',
      negotiating: 'bg-orange-100 text-orange-800',
      under_contract: 'bg-teal-100 text-teal-800',
      closed: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getTemperatureBadge = (temperature: string) => {
    const styles = {
      hot: 'bg-red-500 text-white',
      warm: 'bg-orange-500 text-white',
      cold: 'bg-blue-500 text-white',
    };
    return styles[temperature as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  const getTemperatureIcon = (temperature: string) => {
    if (temperature === 'hot') return <TrendingUp className="w-4 h-4" />;
    if (temperature === 'warm') return <Activity className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    hot: leads.filter(l => l.temperature === 'hot').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1C2833' }}>
                CRM & Contacts
              </h1>
              <p className="text-gray-600 mt-1">Manage leads, clients, and relationships</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: '#5EA8A7' }}
            >
              <PlusCircle className="w-5 h-5" />
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Contacts</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>{stats.total}</p>
              </div>
              <Users className="w-8 h-8" style={{ color: '#5EA8A7' }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">New Leads</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>{stats.new}</p>
              </div>
              <Star className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Qualified</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>{stats.qualified}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Hot Leads</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>{stats.hot}</p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: '#FE4447' }} />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="showing_scheduled">Showing Scheduled</option>
              <option value="negotiating">Negotiating</option>
              <option value="under_contract">Under Contract</option>
              <option value="closed">Closed</option>
              <option value="lost">Lost</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Temperature Filter */}
            <select
              value={temperatureFilter}
              onChange={(e) => setTemperatureFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
            >
              <option value="all">All Temperatures</option>
              <option value="hot">🔥 Hot</option>
              <option value="warm">🌡️ Warm</option>
              <option value="cold">❄️ Cold</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : ''
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#5EA8A7' }}></div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mt-6">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600">Add your first contact to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold" style={{ color: '#1C2833' }}>
                      {lead.first_name} {lead.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{lead.lead_source || 'Direct'}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTemperatureBadge(lead.temperature)}`}>
                      {getTemperatureIcon(lead.temperature)}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(lead.status)}`}>
                    {lead.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${lead.email}`} className="hover:underline truncate">
                      {lead.email}
                    </a>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href={`tel:${lead.phone}`} className="hover:underline">
                        {lead.phone}
                      </a>
                    </div>
                  )}
                </div>

                {(lead.budget_min || lead.budget_max) && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>
                      {lead.budget_min && formatPrice(lead.budget_min)} - {lead.budget_max && formatPrice(lead.budget_max)}
                    </span>
                  </div>
                )}

                {lead.preferred_cities && lead.preferred_cities.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{lead.preferred_cities.join(', ')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Added {formatDate(lead.created_at)}</span>
                    {lead.assigned_agent && (
                      <span>Assigned to {lead.assigned_agent.first_name}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowAddModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm"
                    style={{ borderColor: '#5EA8A7', color: '#5EA8A7' }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Temp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold" style={{ color: '#1C2833' }}>
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{lead.lead_source}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{lead.email}</div>
                        {lead.phone && <div className="text-sm text-gray-500">{lead.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(lead.status)}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTemperatureBadge(lead.temperature)}`}>
                          {lead.temperature.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {lead.budget_min && lead.budget_max
                          ? `${formatPrice(lead.budget_min)} - ${formatPrice(lead.budget_max)}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowAddModal(true);
                            }}
                            className="p-2 rounded-lg border hover:bg-gray-50"
                            style={{ borderColor: '#5EA8A7', color: '#5EA8A7' }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold" style={{ color: '#1C2833' }}>
                {selectedLead ? 'Edit Contact' : 'Add New Contact'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Contact form will be implemented here</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white font-semibold transition-colors"
                style={{ backgroundColor: '#5EA8A7' }}
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
