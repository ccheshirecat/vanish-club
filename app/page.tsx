import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Shield, Lock, MessageSquare, Pill, Wind, DollarSign } from "lucide-react"
import Link from "next/link"
import { SearchAutocomplete } from "@/components/search-autocomplete"
const stats = [
  { label: "Active Vendors", value: "2,400+" },
  { label: "Daily Listings", value: "1,200+" },
  { label: "Success Rate", value: "99.9%" },
  { label: "Response Time", value: "< 5m" },
]

const categories = [
  {
    name: "Drugs",
    description: "Methamphetamine, ecstasy, cannabis, etc.",
    count: "850+",
    icon: Pill,
  },
  {
    name: "Vapes",
    description: "Vaping devices, lana pods, etc",
    count: "640+",
    icon: Wind,
  },
  {
    name: "Financial Services",
    description: "Moneylenders, bank loan rentals, etc",
    count: "420+",
    icon: DollarSign,
  },
]

const features = [
  {
    title: "End-to-End Encryption",
    description: "All communications are fully encrypted and secure.",
    icon: Lock,
  },
  {
    title: "Anonymous Transactions",
    description: "Privacy-preserving payment methods supported.",
    icon: Shield,
  },
  {
    title: "Instant Messaging",
    description: "Real-time encrypted chat with vendors.",
    icon: MessageSquare,
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-black to-gray-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-100 mb-6">Privacy-First Marketplace</h1>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">
              Connect directly with verified vendors. Purchase freely. Your privacy is our priority.
            </p>
            <div className="flex items-center max-w-md mx-auto">
              <SearchAutocomplete />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 md:mb-20">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-gray-900/20 border-gray-800 p-4">
                <p className="text-xl md:text-2xl font-bold text-gray-100">{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Featured Categories */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-100">Featured Categories</h2>
              <Link href="/listings" passHref>
                <Button variant="link" className="text-gray-400">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="group bg-gradient-to-b from-gray-900/50 to-gray-900/30 border-gray-800/50 hover:border-gray-700/50 transition-all duration-300"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <category.icon className="h-6 w-6 text-gray-400 group-hover:text-gray-300" />
                      <Badge variant="outline" className="border-gray-800 text-gray-400">
                        {category.count}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-gray-100 font-medium mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-900/50 bg-gradient-to-b from-black to-gray-900/10 py-12 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex p-3 rounded-lg bg-gray-900/50 border border-gray-800/50 mb-4">
                  <feature.icon className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-gray-100 font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

