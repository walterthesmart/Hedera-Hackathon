import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Property } from '@/types'
import PropertyCard from '@/components/property/PropertyCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { 
  ArrowRightIcon,
  BuildingOfficeIcon,
  TrendingUpIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface FeaturedPropertiesProps {
  className?: string
  limit?: number
}

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ 
  className, 
  limit = 6 
}) => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'trending' | 'high-yield'>('all')

  // Mock featured properties data
  const mockProperties: Property[] = [
    {
      id: '1',
      tokenId: 'PROP001',
      name: 'Luxury Downtown Apartment',
      description: 'Modern 2-bedroom apartment in the heart of downtown with stunning city views and premium amenities.',
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
      name: 'Prime Commercial Office',
      description: 'Premium commercial real estate in business district with long-term corporate tenants.',
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
      description: 'Beautiful 4-bedroom family home in quiet suburban neighborhood with excellent schools.',
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
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProperties(mockProperties.slice(0, limit))
      setLoading(false)
    }

    fetchProperties()
  }, [limit])

  const filters = [
    { key: 'all', label: 'All Properties', icon: BuildingOfficeIcon },
    { key: 'new', label: 'New Listings', icon: StarIcon },
    { key: 'trending', label: 'Trending', icon: TrendingUpIcon },
    { key: 'high-yield', label: 'High Yield', icon: TrendingUpIcon },
  ] as const

  const filteredProperties = properties.filter(property => {
    switch (activeFilter) {
      case 'new':
        return new Date().getTime() - new Date(property.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
      case 'trending':
        return (property.totalTokens - property.availableTokens) / property.totalTokens > 0.5
      case 'high-yield':
        return (property.metadata.expectedAnnualReturn || 0) >= 8
      default:
        return true
    }
  })

  return (
    <section className={cn('section-spacing', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="w-fit mx-auto">
            <BuildingOfficeIcon className="w-4 h-4 mr-2" />
            Featured Properties
          </Badge>
          
          <h2 className="text-responsive-lg font-bold text-balance">
            Discover Premium Investment Opportunities
          </h2>
          
          <p className="text-responsive-base text-muted-foreground max-w-3xl mx-auto">
            Explore our curated selection of high-quality real estate properties 
            available for fractional ownership investment.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.key)}
              className="group"
            >
              <filter.icon className="w-4 h-4 mr-2" />
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredProperties.map((property, index) => (
              <div 
                key={property.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filter criteria or check back later for new listings.
            </p>
            <Button variant="outline" onClick={() => setActiveFilter('all')}>
              View All Properties
            </Button>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="group">
            <Link href="/properties">
              View All Properties
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProperties
