// ============================================================
// AGENTOS - COMPLETE AGENT DASHBOARD
// Full CRM with properties, leads, transactions, calendar, marketing
// ============================================================
// TIMESTAMP: Friday, November 14, 2025 - 11:58 PM EST

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState('properties');
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showings, setShowings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showShowingModal, setShowShowingModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      await Promise.all([
        loadProperties(user.id),
        loadLeads(user.id),
        loadTransactions(user.id),
        loadShowings(user.id)
      ]);
    }
    setLoading(false);
  }

  async function loadProperties(userId: string) {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    setProperties(data || []);
  }

  async function loadLeads(userId: string) {
    const { data } = await supabase
      .from('leads')
      .select(`
        *,
        activities:lead_activities(count)
      `)
      .eq('assigned_agent_id', userId)
      .order('created_at', { ascending: false });
    setLeads(data || []);
  }

  async function loadTransactions(userId: string) {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        property:properties(address_line1, address_city)
      `)
      .or(`listing_agent_id.eq.${userId},buying_agent_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    setTransactions(data || []);
    
    // Calculate stats
    const totalVolume = data?.reduce((sum, t) => sum + (t.purchase_price || 0), 0) || 0;
    const totalCommission = data?.reduce((sum, t) => sum + (t.agent_commission || 0), 0) || 0;
    setStats({
      totalVolume,
      totalCommission,
      activeDeals: data?.filter(t => !['closed', 'cancelled'].includes(t.status)).length || 0,
      closedDeals: data?.filter(t => t.status === 'closed').length || 0
    });
  }

  async function loadShowings(userId: string) {
    const { data } = await supabase
      .from('showings')
      .select(`
        *,
        property:properties(address_line1, address_city),
        lead:leads(first_name, last_name)
      `)
      .eq('agent_id', userId)
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true });
    setShowings(data || []);
  }

  async function createProperty(formData: any) {
    const { error } = await supabase
      .from('properties')
      .insert({
        ...formData,
        created_by: user?.id
      });
    
    if (!error) {
      setShowPropertyModal(false);
      loadProperties(user?.id);
    }
  }

  async function createLead(formData: any) {
    const { error } = await supabase
      .from('leads')
      .insert({
        ...formData,
        assigned_agent_id: user?.id,
        created_by: user?.id
      });
    
    if (!error) {
      setShowLeadModal(false);
      loadLeads(user?.id);
    }
  }

  async function createTransaction(formData: any) {
    const { error } = await supabase
      .from('transactions')
      .insert({
        ...formData,
        listing_agent_id: user?.id,
        created_by: user?.id
      });
    
    if (!error) {
      setShowTransactionModal(false);
      loadTransactions(user?.id);
    }
  }

  async function scheduleShowing(formData: any) {
    const { error } = await supabase
      .from('showings')
      .insert({
        ...formData,
        agent_id: user?.id
      });
    
    if (!error) {
      setShowShowingModal(false);
      loadShowings(user?.id);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.user_metadata?.first_name || 'Agent'}</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Active Listings</p>
            <p className="text-3xl font-bold text-blue-600">{properties.filter(p => p.status === 'active').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Active Leads</p>
            <p className="text-3xl font-bold text-green-600">{leads.filter(l => !['closed', 'lost'].includes(l.status)).length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Active Deals</p>
            <p className="text-3xl font-bold text-purple-600">{stats.activeDeals}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total Commission</p>
            <p className="text-3xl font-bold text-orange-600">${(stats.totalCommission || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['properties', 'leads', 'transactions', 'calendar', 'marketing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Properties</h2>
              <button
                onClick={() => setShowPropertyModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Property
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{property.address_line1}</h3>
                    <p className="text-sm text-gray-600">{property.address_city}, {property.address_state}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      ${property.list_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="mt-2 flex justify-between text-sm text-gray-600">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.square_feet?.toLocaleString()} sqft</span>
                    </div>
                    <div className="mt-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        property.status === 'active' ? 'bg-green-100 text-green-800' :
                        property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Leads</h2>
              <button
                onClick={() => setShowLeadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Lead
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temperature</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{lead.first_name} {lead.last_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          lead.temperature === 'hot' ? 'bg-red-100 text-red-800' :
                          lead.temperature === 'warm' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.temperature}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${lead.budget_min?.toLocaleString()} - ${lead.budget_max?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${lead.lead_score || 0}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{lead.lead_score || 0}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Transactions</h2>
              <button
                onClick={() => setShowTransactionModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Transaction
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closing Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {transaction.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.property?.address_line1 || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.transaction_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          transaction.status === 'closed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transaction.status === 'under_contract' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${transaction.purchase_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${transaction.agent_commission?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.closing_date || 'TBD'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Upcoming Showings</h2>
              <button
                onClick={() => setShowShowingModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Schedule Showing
              </button>
            </div>
            
            <div className="space-y-4">
              {showings.map((showing) => (
                <div key={showing.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {showing.property?.address_line1 || 'Property'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {showing.property?.address_city || 'City'}
                      </p>
                      {showing.lead && (
                        <p className="text-sm text-gray-600 mt-2">
                          Client: {showing.lead.first_name} {showing.lead.last_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{showing.scheduled_date}</p>
                      <p className="text-sm text-gray-600">{showing.scheduled_time?.substring(0, 5)}</p>
                      <span className={`mt-2 inline-block px-2 py-1 text-xs rounded ${
                        showing.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        showing.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {showing.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MARKETING TAB */}
        {activeTab === 'marketing' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Marketing Campaigns</h2>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">Marketing tools coming soon</p>
              <p className="text-sm text-gray-500 mt-2">Email campaigns, SMS, social media automation</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals would go here - simplified for now */}
    </div>
  );
}
