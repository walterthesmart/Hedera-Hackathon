import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useWallet } from '@/lib/WalletContext'
import HeroSection from '@/components/sections/HeroSection'
import FeaturedProperties from '@/components/sections/FeaturedProperties'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const HomePage: React.FC = () => {
  const { wallet, connectWallet } = useWallet()

  const features = [
    {
      icon: BuildingOfficeIcon,
      title: 'Property Tokenization',
      description: 'Convert real estate properties into NFTs on the Hedera network for transparent ownership and immutable records.',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Fractional Ownership',
      description: 'Invest in premium properties with as little as $100 through fractional token ownership and diversify your portfolio.',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: ChartBarIcon,
      title: 'Automated Returns',
      description: 'Receive rental income automatically distributed to your wallet based on your ownership percentage with smart contracts.',
      color: 'text-hedera',
      bgColor: 'bg-hedera/10'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Compliant',
      description: 'Built with KYC/AML compliance and smart contract security audits for peace of mind and regulatory adherence.',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
  ]

  const stats = [
    {
      label: 'Total Properties',
      value: '150+',
      icon: BuildingOfficeIcon,
      description: 'Premium properties listed',
      trend: '+12% this month'
    },
    {
      label: 'Active Investors',
      value: '2,500+',
      icon: UserGroupIcon,
      description: 'Verified investors',
      trend: '+25% this month'
    },
    {
      label: 'Total Value Locked',
      value: '$50M+',
      icon: CurrencyDollarIcon,
      description: 'Assets under management',
      trend: '+18% this month'
    },
    {
      label: 'Average Returns',
      value: '8.5%',
      icon: ChartBarIcon,
      description: 'Annual percentage yield',
      trend: 'Consistent performance'
    },
  ]

  const benefits = [
    { text: 'Low minimum investment ($100)', icon: CurrencyDollarIcon },
    { text: 'Instant liquidity through token trading', icon: ClockIcon },
    { text: 'Transparent blockchain-based ownership', icon: ShieldCheckIcon },
    { text: 'Professional property management', icon: StarIcon },
    { text: 'Automated rent distribution', icon: TrendingUpIcon },
    { text: 'Global property access', icon: GlobeAltIcon },
  ]

  return (
    <>
      <Head>
        <title>RealEstateToken - Democratizing Real Estate Investment</title>
        <meta
          name="description"
          content="Invest in fractional real estate ownership through blockchain technology. Built on Hedera for fast, secure, and low-cost transactions."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="section-spacing bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="w-fit mx-auto mb-4">
              <TrendingUpIcon className="w-4 h-4 mr-2" />
              Platform Statistics
            </Badge>
            <h2 className="text-responsive-lg font-bold mb-4">
              Trusted by Thousands of Investors
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join a growing community of investors who are building wealth through
              fractional real estate ownership on the blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm font-medium mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground mb-2">{stat.description}</div>
                  <Badge variant="outline" className="text-xs">
                    {stat.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <FeaturedProperties limit={3} />

      {/* Features Section */}
      <section className="section-spacing bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="w-fit mx-auto mb-4">
              <StarIcon className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-responsive-lg font-bold mb-4">
              Why Choose RealEstateToken?
            </h2>
            <p className="text-responsive-base text-muted-foreground max-w-3xl mx-auto">
              Experience the future of real estate investment with our innovative platform
              built on cutting-edge blockchain technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className={cn(
                    "w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300",
                    feature.bgColor,
                    "group-hover:scale-110"
                  )}>
                    <feature.icon className={cn("w-8 h-8", feature.color)} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-spacing bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="w-fit mb-4">
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  Blockchain Benefits
                </Badge>
                <h2 className="text-responsive-lg font-bold mb-6">
                  Invest Smarter with Blockchain Technology
                </h2>
                <p className="text-responsive-base text-muted-foreground">
                  Our platform leverages the power of Hedera Hashgraph to provide
                  fast, secure, and cost-effective real estate investment opportunities.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-success" />
                    </div>
                    <span className="font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-primary to-hedera text-primary-foreground border-0 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <GlobeAltIcon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-white">Powered by Hedera</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <div className="text-2xl font-bold">3-5s</div>
                      <div className="text-sm opacity-90">Transaction Speed</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <div className="text-2xl font-bold">$0.0001</div>
                      <div className="text-sm opacity-90">Transaction Cost</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-sm opacity-90">Carbon Negative</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <div className="text-2xl font-bold">Bank</div>
                      <div className="text-sm opacity-90">Grade Security</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Enterprise Ready
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-hedera rounded-full animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary rounded-full animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gradient-to-br from-primary via-hedera to-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="w-fit mx-auto bg-white/20 text-white border-white/30">
              <StarIcon className="w-4 h-4 mr-2" />
              Start Your Journey
            </Badge>

            <h2 className="text-responsive-xl font-bold text-white text-balance">
              Ready to Start Your Real Estate Journey?
            </h2>

            <p className="text-responsive-base text-white/90 max-w-2xl mx-auto">
              Join thousands of investors who are already building wealth through
              fractional real estate ownership on the blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {wallet.isConnected ? (
                <Button asChild size="lg" variant="secondary" className="group">
                  <Link href="/properties">
                    Browse Properties
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={connectWallet}
                  size="lg"
                  variant="secondary"
                  className="group"
                >
                  Get Started Now
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-primary">
                <Link href="/learn-more">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2 text-white/80">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="text-sm">SEC Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <GlobeAltIcon className="w-5 h-5" />
                <span className="text-sm">Hedera Network</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <TrendingUpIcon className="w-5 h-5" />
                <span className="text-sm">$150K Prize Pool</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
