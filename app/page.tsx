'use client'

export default function Home() {
  const propertyCategories = [
    { name: 'Residential - Buy', icon: '🏡', color: 'bg-blue-100 text-blue-700', link: '/search?type=residential&mode=buy' },
    { name: 'Residential - Rent', icon: '🏠', color: 'bg-green-100 text-green-700', link: '/search?type=residential&mode=rent' },
    { name: 'Commercial - Buy', icon: '🏢', color: 'bg-purple-100 text-purple-700', link: '/search?type=commercial&mode=buy' },
    { name: 'Commercial - Rent', icon: '🏬', color: 'bg-orange-100 text-orange-700', link: '/search?type=commercial&mode=rent' },
    { name: 'Industrial - Buy', icon: '🏭', color: 'bg-gray-100 text-gray-700', link: '/search?type=industrial&mode=buy' },
    { name: 'Industrial - Rent', icon: '🏗️', color: 'bg-yellow-100 text-yellow-700', link: '/search?type=industrial&mode=rent' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Your Story. Our Expertise.</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Husband and wife team serving Naples, Fort Myers, Bonita Springs, and Lehigh Acres with integrity and local knowledge.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/search" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Search Properties
              </a>
              <a href="/contact" className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Property Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Browse by Property Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propertyCategories.map((category) => (
            <a 
              key={category.name}
              href={category.link}
              className={`${category.color} p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer`}
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold">{category.name}</h3>
            </a>
          ))}
        </div>
      </div>

      {/* Agent Profiles */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Your Agents</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tony Harvey */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👨‍💼
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Tony Harvey</h3>
              <p className="text-gray-600 text-center mb-4">Real Estate Professional</p>
              <div className="text-gray-700 space-y-2">
                <p>✓ Graduated from Heidelberg University, Tiffin, Ohio</p>
                <p>✓ Extensive mortgage industry background</p>
                <p>✓ Strong negotiation skills</p>
                <p>✓ Specializing in buyer and seller representation</p>
              </div>
            </div>

            {/* Laura Harvey */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-32 h-32 bg-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👩‍💼
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Laura Harvey</h3>
              <p className="text-gray-600 text-center mb-4">Real Estate Professional</p>
              <div className="text-gray-700 space-y-2">
                <p>✓ Born and raised in Naples, Florida</p>
                <p>✓ Naples High School Class of 2001</p>
                <p>✓ Deep local Collier County expertise</p>
                <p>✓ Community connections throughout Southwest Florida</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-6">Our Story</h2>
          <div className="max-w-3xl mx-auto text-gray-700 space-y-4">
            <p className="text-lg">
              Tony and Laura met in April 2007 in Key West, Florida, where their shared passion for helping people 
              and building lasting relationships first brought them together.
            </p>
            <p className="text-lg">
              After getting engaged in 2012 and marrying in Naples in 2013, they combined their unique strengths - 
              Tony's mortgage industry expertise and Laura's deep local knowledge - to create a real estate partnership 
              that truly puts clients first.
            </p>
            <p className="text-lg">
              Today, they serve families throughout Naples, Fort Myers, Bonita Springs, and Lehigh Acres, bringing 
              both professional excellence and personal care to every transaction.
            </p>
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Our Service Areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-xl font-semibold">Naples</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-xl font-semibold">Fort Myers</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-xl font-semibold">Bonita Springs</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-xl font-semibold">Lehigh Acres</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-xl mb-8">Let's start your real estate journey together.</p>
          <a href="/contact" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  )
}
