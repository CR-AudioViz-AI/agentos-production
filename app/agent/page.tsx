'use client'

export default function AgentDashboard() {
  const stats = {
    activeLeads: 24,
    scheduledShowings: 8,
    activeListings: 12,
    closedDeals: 156,
  }

  const recentLeads = [
    { id: 1, name: 'John Smith', email: 'john@email.com', property: 'Naples Waterfront Condo', status: 'New' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', property: 'Fort Myers Home', status: 'Contacted' },
    { id: 3, name: 'Mike Williams', email: 'mike@email.com', property: 'Commercial Building', status: 'Showing Scheduled' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="mt-2">Welcome back, Tony & Laura!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-gray-600 text-sm">Active Leads</p>
            <p className="text-3xl font-bold text-blue-600">{stats.activeLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-gray-600 text-sm">Showings Today</p>
            <p className="text-3xl font-bold text-green-600">{stats.scheduledShowings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">🏠</div>
            <p className="text-gray-600 text-sm">Active Listings</p>
            <p className="text-3xl font-bold text-purple-600">{stats.activeListings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-gray-600 text-sm">Total Closed</p>
            <p className="text-3xl font-bold text-orange-600">{stats.closedDeals}</p>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interested In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{lead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{lead.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{lead.property}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'New' ? 'bg-green-100 text-green-700' :
                        lead.status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
