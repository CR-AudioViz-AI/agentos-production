'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your message! Tony & Laura will contact you soon.')
    setFormData({ name: '', email: '', phone: '', interest: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-2 text-lg">Let's discuss your real estate needs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg p-3"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full border rounded-lg p-3"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">I'm interested in:</label>
                <select
                  className="w-full border rounded-lg p-3"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                >
                  <option value="">Select an option</option>
                  <option value="residential-buy">Buying Residential Property</option>
                  <option value="residential-rent">Renting Residential Property</option>
                  <option value="commercial-buy">Buying Commercial Property</option>
                  <option value="commercial-rent">Renting Commercial Property</option>
                  <option value="industrial-buy">Buying Industrial Property</option>
                  <option value="industrial-rent">Renting Industrial Property</option>
                  <option value="selling">Selling My Property</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  required
                  rows={6}
                  className="w-full border rounded-lg p-3"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:info@tonylauraharvey.com" className="text-blue-600 hover:underline">
                      info@tonylauraharvey.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-2xl">📱</div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:+12395551234" className="text-blue-600 hover:underline">
                      (239) 555-1234
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-2xl">🏢</div>
                  <div>
                    <h3 className="font-semibold mb-1">Brokerage</h3>
                    <p>Premiere Plus Realty</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Serving Naples, Fort Myers,<br />
                      Bonita Springs & Lehigh Acres
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <h3 className="font-semibold mb-1">Office Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9am - 6pm</p>
                    <p className="text-gray-600">Saturday: 10am - 4pm</p>
                    <p className="text-gray-600">Sunday: By appointment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="w-20 h-20 bg-blue-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                  👨‍💼
                </div>
                <h3 className="font-bold">Tony Harvey</h3>
                <p className="text-sm text-gray-600">Real Estate Professional</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="w-20 h-20 bg-purple-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                  👩‍💼
                </div>
                <h3 className="font-bold">Laura Harvey</h3>
                <p className="text-sm text-gray-600">Real Estate Professional</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
