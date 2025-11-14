'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Building2, MapPin, LogOut, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  markets: string[] | null;
}

interface Property {
  id: string;
  address_street: string;
  address_city: string;
  list_price: number | null;
  rental_price_monthly: number | null;
  category: string;
  status: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'agents' | 'properties'>('agents');
  const [agents, setAgents] = useState<Profile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState({ totalAgents: 0, activeAgents: 0, totalProperties: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: agentsData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: propertiesData } = await supabase.from('properties').select('*').limit(100);

      setAgents(agentsData || []);
      setProperties(propertiesData || []);

      const activeCount = (agentsData || []).filter(a => a.is_active).length;
      setStats({
        totalAgents: (agentsData || []).length,
        activeAgents: activeCount,
        totalProperties: (propertiesData || []).length
      });
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

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Delete this agent? This will remove their login access.')) return;
    try {
      await supabase.from('profiles').delete().eq('id', agentId);
      await loadData();
      alert('Agent deleted');
    } catch (error) {
      alert('Failed to delete agent');
    }
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', agentId);
      await loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.first_name && agent.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (agent.last_name && agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AgentOS Admin</h1>
              <p className="text-sm text-gray-600">Platform Management</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 ${activeTab === 'agents' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600'}`}
            >
              <Users className="w-4 h-4" />
              Agents ({stats.totalAgents})
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 ${activeTab === 'properties' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600'}`}
            >
              <MapPin className="w-4 h-4" />
              Properties ({stats.totalProperties})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">{stats.totalAgents}</div>
            <div className="text-sm text-gray-600">Total Agents</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{stats.activeAgents}</div>
            <div className="text-sm text-gray-600">Active Agents</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.totalProperties}</div>
            <div className="text-sm text-gray-600">Total Properties</div>
          </div>
        </div>

        {activeTab === 'agents' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Agent Management</h2>
                <button
                  onClick={() => setShowAddAgent(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Agent
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search agents..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Markets</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{agent.first_name} {agent.last_name}</div>
                        <div className="text-sm text-gray-500">{agent.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{agent.role}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{agent.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm">{agent.markets?.join(', ') || 'All'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAgentStatus(agent.id, agent.is_active)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {agent.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => deleteAgent(agent.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">All Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {properties.map((property) => {
                const price = property.rental_price_monthly || property.list_price;
                const isRental = property.category.includes('rental');
                return (
                  <div key={property.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                    <div className="font-semibold mb-2">{property.address_street}</div>
                    <div className="text-sm text-gray-600 mb-2">{property.address_city}, FL</div>
                    <div className="text-lg font-bold text-purple-600 mb-2">
                      ${price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {isRental && <span className="text-sm font-normal">/month</span>}
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{property.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showAddAgent && <AddAgentModal onClose={() => setShowAddAgent(false)} onSuccess={loadData} />}
    </div>
  );
}

function AddAgentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    markets: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const floridaMarkets = ['Naples', 'Fort Myers', 'Bonita Springs', 'Miami', 'Tampa', 'Orlando', 'Jacksonville'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          markets: formData.markets,
          organizationId: '00000000-0000-0000-0000-000000000001'
        })
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      alert(`Agent created!\n\nLogin: ${formData.email}\nPassword: TempPass2025!\n\nThey should change this on first login.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Agent</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
              className="px-4 py-2 border rounded-lg"
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Markets (select multiple)</label>
            <div className="grid grid-cols-2 gap-2">
              {floridaMarkets.map((market) => (
                <label key={market} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.markets.includes(market)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, markets: [...formData.markets, market]});
                      } else {
                        setFormData({...formData, markets: formData.markets.filter(m => m !== market)});
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{market}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Agent'}
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
  );
}
