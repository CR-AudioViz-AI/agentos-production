'use client'

export default function CustomerPortal() {
  const savedProperties = [
    { id: 1, title: 'Waterfront Condo - Naples', price: 450000, saved: '2 days ago' },
    { id: 2, title: 'Commercial Building - Fort Myers', price: 850000, saved: '5 days ago' },
  ]

  const savedSearches = [
    { id: 1, name: 'Naples Condos under $500k', results: 15, updated: '1 hour ago' },
    { id: 2, name: 'Commercial Properties - Downtown', results: 8, updated: '2 days ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">My Portal</h1>
          <p className="mt-2">Track your saved properties and searches</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Saved Properties */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Saved Properties</h2>
              </div>
              <div className="p-6 space-y-4">
                {savedProperties.map(property => (
                  <div key={property.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{property.title}</h3>
                    <p className="text-blue-600 font-bold text-lg mb-2">${property.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mb-4">Saved {property.saved}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        View Details
                      </button>
                      <button className="px-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {savedProperties.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No saved properties yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Saved Searches */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Saved Searches</h2>
              </div>
              <div className="p-6 space-y-4">
                {savedSearches.map(search => (
                  <div key={search.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{search.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{search.results} results</p>
                    <p className="text-sm text-gray-500 mb-4">Updated {search.updated}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        View Results
                      </button>
                      <button className="px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                {savedSearches.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No saved searches yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Email Alerts */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Email Alerts</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Daily Property Updates</h3>
                <p className="text-sm text-gray-600">Get notified when new properties match your saved searches</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
