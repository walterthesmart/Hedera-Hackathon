import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Property } from '@/types'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn, formatCurrency, formatPercentage } from '@/lib/utils'
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon,
  TrendingUpIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface PropertyCardProps {
  property: Property
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const {
    id,
    name,
    description,
    address,
    propertyType,
    totalValue,
    totalTokens,
    availableTokens,
    tokenPrice,
    images,
    metadata,
    createdAt
  } = property

  const investmentProgress = ((totalTokens - availableTokens) / totalTokens) * 100
  const expectedReturn = metadata.expectedAnnualReturn || 0
  const monthlyRent = metadata.rentPerMonth || 0
  const isFullyFunded = availableTokens === 0
  const isNewListing = new Date().getTime() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days

  const getPropertyTypeIcon = () => {
    switch (propertyType) {
      case 'residential':
        return HomeIcon
      case 'commercial':
        return BuildingOfficeIcon
      default:
        return BuildingOfficeIcon
    }
  }

  const PropertyTypeIcon = getPropertyTypeIcon()

  const getPropertyTypeBadgeVariant = () => {
    switch (propertyType) {
      case 'residential':
        return 'default'
      case 'commercial':
        return 'secondary'
      case 'industrial':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getReturnBadgeVariant = () => {
    if (expectedReturn >= 10) return 'success'
    if (expectedReturn >= 7) return 'default'
    return 'secondary'
  }

  return (
    <Card className="property-card group overflow-hidden">
      {/* Property Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt={name}
            fill
            className="property-image"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = '/images/property-placeholder.jpg'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <PropertyTypeIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge variant={getPropertyTypeBadgeVariant()} className="bg-background/90 backdrop-blur-sm">
            <PropertyTypeIcon className="w-3 h-3 mr-1" />
            {propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}
          </Badge>
          {isNewListing && (
            <Badge variant="success" className="bg-success/90 backdrop-blur-sm">
              <StarIcon className="w-3 h-3 mr-1" />
              New
            </Badge>
          )}
        </div>

        {/* Investment Progress Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={isFullyFunded ? "success" : "default"}
            className="bg-background/90 backdrop-blur-sm"
          >
            {isFullyFunded ? "Fully Funded" : `${investmentProgress.toFixed(0)}% Funded`}
          </Badge>
        </div>

        {/* Return Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant={getReturnBadgeVariant()} className="bg-background/90 backdrop-blur-sm">
            <TrendingUpIcon className="w-3 h-3 mr-1" />
            {formatPercentage(expectedReturn)} APY
          </Badge>
        </div>
      </div>

      {/* Property Details */}
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="property-location">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {address.city}, {address.state}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Total Value
            </div>
            <div className="property-price">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Min Investment
            </div>
            <div className="text-lg font-semibold">
              {formatCurrency(tokenPrice)}
            </div>
          </div>
        </div>

        {/* Investment Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available Tokens</span>
            <span className="font-medium">
              {availableTokens.toLocaleString()} / {totalTokens.toLocaleString()}
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${investmentProgress}%` }}
            />
          </div>

          {/* Investment Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <ChartBarIcon className="w-4 h-4 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">APY</div>
                <div className="font-semibold text-success">
                  {formatPercentage(expectedReturn)}
                </div>
              </div>
            </div>

            {monthlyRent > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Monthly</div>
                  <div className="font-semibold">
                    {formatCurrency(monthlyRent)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Features */}
        {metadata && (
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
            {metadata.bedrooms && (
              <span className="flex items-center gap-1">
                <HomeIcon className="w-3 h-3" />
                {metadata.bedrooms} bed
              </span>
            )}
            {metadata.bathrooms && (
              <span>{metadata.bathrooms} bath</span>
            )}
            {metadata.squareFeet && (
              <span>{metadata.squareFeet.toLocaleString()} sq ft</span>
            )}
            {metadata.yearBuilt && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {metadata.yearBuilt}
              </span>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>Listed {formatDate(createdAt)}</span>
        </div>

        <Button asChild size="sm" className="ml-auto">
          <Link href={`/properties/${id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PropertyCard
