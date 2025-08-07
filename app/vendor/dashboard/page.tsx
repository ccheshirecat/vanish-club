export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { VendorListingForm } from "@/components/vendor-listing-form"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function VendorDashboardPage() {
  const user = await auth()
  
  if (!user?.isVendor) {
    redirect("/")
  }

  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  const formatPrice = (listing: {
    minPrice: number | null
    maxPrice: number | null
    contactPrice: boolean
  }) => {
    if (listing.contactPrice) {
      return "Contact for Price"
    }
    if (listing.minPrice && listing.maxPrice) {
      return `$${listing.minPrice.toLocaleString()} - $${listing.maxPrice.toLocaleString()}`
    }
    if (listing.minPrice) {
      return `From $${listing.minPrice.toLocaleString()}`
    }
    if (listing.maxPrice) {
      return `Up to $${listing.maxPrice.toLocaleString()}`
    }
    return "Price not specified"
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Create Listing</h2>
            <VendorListingForm />
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Your Listings</h2>
            <div className="space-y-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="bg-gray-900/50 border-gray-800 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{listing.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{listing.description}</p>
                    </div>
                    <Badge className="bg-gray-800 text-gray-300">
                      {formatPrice(listing)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-gray-800/50 text-gray-300 border-gray-700">
                      {listing.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
              {listings.length === 0 && (
                <p className="text-gray-500 text-center py-8">No listings yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


