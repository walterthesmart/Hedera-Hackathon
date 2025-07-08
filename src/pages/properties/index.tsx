import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useWallet } from '@/lib/WalletContext'
import PropertyCard from '@/components/property/PropertyCard'
import { Property } from '@/types'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

const PropertiesPage: React.FC = () => {
  const { wallet } = useWallet()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  // Mock properties data
  const mockProperties: Property[] = [
    {
      id: '1',
      tokenId: 'PROP001',
      name: 'Luxury Downtown Apartment',
      description: 'Modern 2-bedroom apartment in the heart of downtown with stunning city views.',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      propertyType: 'residential',
      totalValue: 500000,
      totalTokens: 1000,
      availableTokens: 750,
      tokenPrice: 500,
      images: ['/images/property1.jpg'],
      documents: [],
      owner: '0.0.123456',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      metadata: {
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        yearBuilt: 2020,
        expectedAnnualReturn: 8.5,
        rentPerMonth: 3500,
        occupancyRate: 95
      }
    },
    {
      id: '2',
      tokenId: 'PROP002',
      name: 'Commercial Office Building',
      description: 'Prime commercial real estate in business district with long-term tenants.',
      address: {
        street: '456 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      },
      propertyType: 'commercial',
      totalValue: 2000000,
      totalTokens: 4000,
      availableTokens: 2800,
      tokenPrice: 500,
      images: ['/images/property2.jpg'],
      documents: [],
      owner: '0.0.789012',
      status: 'active',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      metadata: {
        squareFeet: 15000,
        yearBuilt: 2018,
        expectedAnnualReturn: 7.2,
        rentPerMonth: 12000,
        occupancyRate: 100
      }
    },
    {
      id: '3',
      tokenId: 'PROP003',
      name: 'Suburban Family Home',
      description: 'Beautiful 4-bedroom family home in quiet suburban neighborhood.',
      address: {
        street: '789 Oak Street',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA',
        coordinates: { lat: 30.2672, lng: -97.7431 }
      },
      propertyType: 'residential',
      totalValue: 350000,
      totalTokens: 700,
      availableTokens: 450,
      tokenPrice: 500,
      images: ['/images/property3.jpg'],
      documents: [],
      owner: '0.0.345678',
      status: 'active',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      metadata: {
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 2500,
        yearBuilt: 2015,
        lotSize: 8000,
        expectedAnnualReturn: 9.1,
        rentPerMonth: 2800,
        occupancyRate: 90
      }
    }
  ]

  useEffect(() => {
    // Simulate API call
    const fetchProperties = async () => {
      setLoading(true)
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProperties(mockProperties)
      setLoading(false)
    }

    fetchProperties()
  }, [])

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || property.propertyType === filterType
    return matchesSearch && matchesType
  })

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'price-low':
        return a.tokenPrice - b.tokenPrice
      case 'price-high':
        return b.tokenPrice - a.tokenPrice
      case 'return-high':
        return (b.metadata.expectedAnnualReturn || 0) - (a.metadata.expectedAnnualReturn || 0)
      default:
        return 0
    }
  })

  return (
    <>
      <Head>
        <title>Properties - RealEstateToken</title>
        <meta name="description" content="Browse and invest in tokenized real estate properties" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Properties</h1>
                <p className="text-gray-600">Discover and invest in tokenized real estate opportunities</p>
              </div>
              {wallet.isConnected && (
                <Link href="/properties/create" className="btn-primary mt-4 md:mt-0">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  List Property
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Property Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="mixed-use">Mixed Use</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="return-high">Highest Returns</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-gray-600">
                <FunnelIcon className="w-5 h-5 mr-2" />
                {sortedProperties.length} properties found
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or check back later for new listings.
              </p>
              {wallet.isConnected && (
                <Link href="/properties/create" className="btn-primary">
                  List Your Property
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PropertiesPage
