'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, Building2, DollarSign, TrendingUp,
  Settings, LogOut, Search, Filter, Plus, Edit2, Trash2,
  Eye, Mail, Phone, MapPin, CheckCircle, XCircle, MessageSquare
} from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  phone: string | null;
  organization_id: string | null;
  is_active: boolean;
  markets: string[] | null;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  subscription_tier: string;
  max_agents: number;
  monthly_fee: number;
}

interface Property {
  id: string;
  address_street: string;
  address_city: string;
  list_price: number;
  bedrooms: number;
  bathrooms: number;
  status: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'orgs' | 'properties' | 'javari'>('agents');
  const [agents, setAgents] = useState<Profile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalOrgs: 0,
    totalProperties: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Profile | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get agents
      const { data: agentsData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Get organizations
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('*');
      
      // Get properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .limit(100);

      setAgents(agentsData || []);
      setOrganizations(orgsData || []);
      setProperties(propertiesData || []);

      // Calculate stats
      const activeCount = (agentsData || []).filter(a => a.is_active).length;
      const revenue = (orgsData || []).reduce((sum, org) => sum + (org.monthly_fee || 0), 0);
      
      setStats({
        totalAgents: (agentsData || []).length,
        activeAgents: activeCount,
        totalOrgs: (orgsData || []).length,
        totalProperties: (propertiesData || []).length,
        totalRevenue: revenue
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', agentId);
      
      if (error) throw error;
      await loadData();
      alert('Agent deleted successfully');
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent');
    }
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', agentId);
      
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error updating agent status:', error);
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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AgentOS Admin</h1>
              <p className="text-sm text-gray-600">Complete Platform Management</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-4">
            {[
              { id: 'agents' as const, label: 'Agents', icon: Users },
              { id: 'orgs' as const, label: 'Organizations', icon: Building2 },
              { id: 'properties' as const, label: 'Properties', icon: MapPin },
              { id: 'javari' as const, label: 'Javari AI', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Agents" value={stats.totalAgents} icon={<Users />} color="purple" />
          <StatCard title="Active Agents" value={stats.activeAgents} icon={<CheckCircle />} color="green" />
          <StatCard title="Organizations" value={stats.totalOrgs} icon={<Building2 />} color="blue" />
          <StatCard title="Properties" value={stats.totalProperties} icon={<MapPin />} color="cyan" />
          <StatCard title="Monthly Revenue" value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`} icon={<DollarSign />} color="emerald" />
        </div>

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Agent Management</h2>
                <button
                  onClick={() => setShowAddAgent(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Agent
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search agents by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Agents List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Markets</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {agent.first_name} {agent.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          agent.role === 'org_owner' ? 'bg-purple-100 text-purple-800' :
                          agent.role === 'team_lead' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {agent.phone || 'No phone'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {agent.markets?.join(', ') || 'All markets'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAgentStatus(agent.id, agent.is_active)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            agent.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {agent.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedAgent(agent)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAgent(agent.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
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

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="font-semibold text-gray-900 mb-2">
                    {property.address_street}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{property.address_city}, FL</div>
                  <div className="text-lg font-bold text-purple-600 mb-2">
                    ${property.list_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JAVARI AI TAB */}
        {activeTab === 'javari' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Javari AI Assistant</h2>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8 text-center">
              <MessageSquare className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Javari AI Integration Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                Get help fixing bugs, analyzing data, and automating tasks with Javari AI embedded right here.
              </p>
              <a 
                href="https://crav-javari.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Open Javari AI in New Tab
              </a>
            </div>
          </div>
        )}

        {/* ORG Management (placeholder for brevity) */}
        {activeTab === 'orgs' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Organizations</h2>
            <div className="space-y-4">
              {organizations.map((org) => (
                <div key={org.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {org.subscription_tier.toUpperCase()} Plan • Max {org.max_agents} agents
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        ${org.monthly_fee ? org.monthly_fee.toFixed(2) : '0.00'}/mo
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {showAddAgent && <AddAgentModal onClose={() => setShowAddAgent(false)} onSuccess={loadData} />}
      
      {/* Edit Agent Modal */}
      {selectedAgent && <EditAgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} onSuccess={loadData} />}
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

// Add Agent Modal (simplified for brevity)
function AddAgentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'temp123456', // They'll reset it
        email_confirm: true
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'agent'
        });

      if (profileError) throw profileError;

      alert('Agent added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding agent:', error);
      alert('Failed to add agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Add New Agent</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Agent'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Agent Modal (simplified)
function EditAgentModal({ agent, onClose, onSuccess }: { agent: Profile; onClose: () => void; onSuccess: () => void }) {
  // Implementation similar to AddAgentModal but with update logic
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Agent</h2>
        <p className="text-gray-600 mb-4">Editing functionality will be implemented next</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
