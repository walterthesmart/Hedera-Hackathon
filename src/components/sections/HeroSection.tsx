import React from 'react'
import Link from 'next/link'
import { useWallet } from '@/lib/WalletContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { 
  ArrowRightIcon,
  PlayIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface HeroSectionProps {
  className?: string
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  const { wallet, connectWallet } = useWallet()

  const stats = [
    { label: 'Properties Listed', value: '150+', icon: GlobeAltIcon },
    { label: 'Total Investment', value: '$50M+', icon: CurrencyDollarIcon },
    { label: 'Average Returns', value: '8.5%', icon: TrendingUpIcon },
    { label: 'Verified Properties', value: '100%', icon: ShieldCheckIcon },
  ]

  return (
    <section className={cn('relative overflow-hidden hero-gradient', className)}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-hedera/10 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <Badge variant="outline" className="w-fit">
              <TrendingUpIcon className="w-4 h-4 mr-2" />
              Hedera Hello Future: Origins Hackathon 2025
            </Badge>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-responsive-xl font-bold text-balance leading-tight">
                Democratizing
                <span className="text-primary block">Real Estate Investment</span>
                <span className="text-hedera">on Hedera</span>
              </h1>
              <p className="text-responsive-base text-muted-foreground max-w-2xl">
                Invest in fractional ownership of premium real estate properties through 
                blockchain technology. Built on Hedera for fast, secure, and low-cost transactions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {wallet.isConnected ? (
                <Button asChild size="lg" className="group">
                  <Link href="/properties">
                    Explore Properties
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              ) : (
                <Button 
                  onClick={connectWallet}
                  size="lg"
                  className="group"
                >
                  Connect Wallet to Start
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
              
              <Button variant="outline" size="lg" className="group">
                <PlayIcon className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheckIcon className="w-5 h-5 text-success" />
                <span>SEC Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GlobeAltIcon className="w-5 h-5 text-hedera" />
                <span>Powered by Hedera</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUpIcon className="w-5 h-5 text-primary" />
                <span>$150K Prize Pool</span>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative animate-scale-in">
            {/* Main Card */}
            <div className="relative bg-card border rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Platform Overview</h3>
                  <Badge variant="success">Live</Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Development Progress</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-hedera h-2 rounded-full w-[85%]" />
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-2">
                  {[
                    'Property Tokenization',
                    'Fractional Ownership',
                    'Automated Rent Distribution',
                    'Multi-Wallet Support'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-hedera rounded-full animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-primary rounded-full animate-pulse delay-1000" />
            </div>

            {/* Background Decoration */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-hedera/20 rounded-3xl blur-xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
