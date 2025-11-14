'use client';

import { useState } from 'react';
import { 
  Home, 
  Users, 
  TrendingUp, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Settings,
  Bell,
  Search
} from 'lucide-react';

type Tab = 'overview' | 'properties' | 'leads' | 'settings';

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedMarket, setSelectedMarket] = useState('Fort Myers');

  const floridaMarkets = [
    'Miami', 'Tampa', 'Orlando', 'Jacksonville', 
    'Fort Myers', 'Tallahassee', 'Naples', 'Sarasota'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, Tony Harvey</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {floridaMarkets.map((market) => (
                  <option key={market} value={market}>{market}</option>
                ))}
              </select>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            {[
              { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
              { id: 'properties', label: 'Properties', icon: <MapPin className="w-4 h-4" /> },
              { id: 'leads', label: 'Leads', icon: <Users className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab market={selectedMarket} />}
        {activeTab === 'properties' && <PropertiesTab market={selectedMarket} />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function OverviewTab({ market }: { market: string }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Listings" value="12" change="+2" icon={<Home />} color="blue" />
        <StatCard title="New Leads" value="8" change="+3" icon={<Users />} color="green" />
        <StatCard title="Scheduled Tours" value="5" change="+1" icon={<Calendar />} color="purple" />
        <StatCard title="Pending Sales" value="$2.4M" change="+$500K" icon={<DollarSign />} color="orange" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity - {market}</h2>
        <div className="space-y-4">
          {[
            { time: '2 hours ago', action: 'New lead inquired about 3BR condo in Miami Beach', type: 'lead' },
            { time: '5 hours ago', action: 'Property tour scheduled for 123 Ocean Dr', type: 'tour' },
            { time: '1 day ago', action: 'Offer accepted on 456 Bay St - $850,000', type: 'sale' },
            { time: '2 days ago', action: 'New listing added: 789 Palm Ave', type: 'listing' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${
                activity.type === 'lead' ? 'bg-green-100 text-green-600' :
                activity.type === 'tour' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'sale' ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {activity.type === 'lead' ? <Users className="w-5 h-5" /> :
                 activity.type === 'tour' ? <Calendar className="w-5 h-5" /> :
                 activity.type === 'sale' ? <TrendingUp className="w-5 h-5" /> :
                 <Home className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertiesTab({ market }: { market: string }) {
  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Types</option>
            <option>Single Family</option>
            <option>Condo</option>
            <option>Townhouse</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Sold</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { address: '123 Ocean Dr', city: 'Miami Beach', price: 1250000, beds: 3, baths: 2, sqft: 2100, status: 'Active' },
          { address: '456 Bay St', city: 'Tampa', price: 850000, beds: 4, baths: 3, sqft: 2800, status: 'Pending' },
          { address: '789 Palm Ave', city: market, price: 625000, beds: 3, baths: 2.5, sqft: 2200, status: 'Active' },
          { address: '321 Sunset Blvd', city: 'Naples', price: 1850000, beds: 5, baths: 4, sqft: 3500, status: 'Active' },
          { address: '654 Marina Way', city: 'Sarasota', price: 975000, beds: 4, baths: 3, sqft: 2600, status: 'Pending' },
          { address: '987 Gulf Shore', city: 'Fort Myers', price: 725000, beds: 3, baths: 2, sqft: 1900, status: 'Active' }
        ].map((property, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-cyan-400"></div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900">{property.address}</p>
                  <p className="text-sm text-gray-600">{property.city}, FL</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  property.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {property.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-3">${(property.price / 1000000).toFixed(2)}M</p>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{property.beds} beds</span>
                <span>{property.baths} baths</span>
                <span>{property.sqft.toLocaleString()} sqft</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadsTab() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Active Leads</h2>
      <div className="space-y-4">
        {[
          { name: 'John & Mary Smith', email: 'jsmith@email.com', phone: '(239) 555-0123', interest: 'Miami Beach Condo', status: 'Hot', date: '2 days ago' },
          { name: 'Robert Johnson', email: 'rjohnson@email.com', phone: '(239) 555-0456', interest: 'Tampa Single Family', status: 'Warm', date: '5 days ago' },
          { name: 'Sarah Williams', email: 'swilliams@email.com', phone: '(239) 555-0789', interest: 'Naples Waterfront', status: 'Hot', date: '1 week ago' },
          { name: 'Michael Davis', email: 'mdavis@email.com', phone: '(239) 555-0321', interest: 'Orlando Townhouse', status: 'Cold', date: '2 weeks ago' }
        ].map((lead, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-gray-900">{lead.name}</p>
                <p className="text-sm text-gray-600">Interested in: {lead.interest}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                lead.status === 'Hot' ? 'bg-red-100 text-red-700' :
                lead.status === 'Warm' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {lead.status}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {lead.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {lead.phone}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Added {lead.date}</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition">
                  Contact
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                  Schedule Tour
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="Tony Harvey"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="tony@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="(239) 555-0100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
            <input
              type="text"
              defaultValue="FL-RE-123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription</h2>
        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900">Pro Plan</p>
            <p className="text-sm text-gray-600">$199/month</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Upgrade to Enterprise
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-green-600">{change}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
