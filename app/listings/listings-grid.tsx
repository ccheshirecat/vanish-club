import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import type { Listing } from "@/lib/types"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

interface ListingsGridProps {
  getListings: () => Promise<{
    listings: Listing[]
    pagination: {
      page: number
      total: number
      pages: number
    }
  }>
}

export async function ListingsGrid({ getListings }: ListingsGridProps) {
  const { listings, pagination } = await getListings()

  const formatPrice = (listing: Listing) => {
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



  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-lg">No listings found</p>
        <p className="text-sm mt-2">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listings/${listing.id}`}>
            <Card className="h-full hover:border-gray-700 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={listing.user.avatar || "/placeholder-avatar.png"}
                    alt={listing.user.displayName}
                    className="w-8 h-8 rounded-full bg-gray-800"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-300 truncate">{listing.user.displayName}</span>
                    {listing.user.isVerified && (
                      <span className="text-xs text-blue-400">Verified Vendor</span>
                    )}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-100 mb-2 line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{listing.description}</p>
                <div className="text-base sm:text-lg font-semibold text-gray-100">
                  {formatPrice(listing)}
                </div>
                {listing.variations && (
                  <div className="mt-2 text-sm text-gray-400">
                    Multiple options available
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 sm:p-6 pt-0">
                <Button variant="secondary" className="w-full text-sm sm:text-base">
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Contact Seller</span>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 overflow-x-auto py-2">
          <Pagination>
            <PaginationContent className="flex-wrap justify-center gap-2">
              {pagination.page > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`/listings?page=${pagination.page - 1}`} />
                </PaginationItem>
              )}
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    href={`/listings?page=${pageNum}`} 
                    isActive={pageNum === pagination.page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {pagination.page < pagination.pages && (
                <PaginationItem>
                  <PaginationNext href={`/listings?page=${pagination.page + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

