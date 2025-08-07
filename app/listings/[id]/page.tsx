import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Chat } from "@/components/chat"
import { Reviews } from "@/components/reviews"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface ListingDetail {
  id: string
  title: string
  description: string
  minPrice: number | null
  maxPrice: number | null
  contactPrice: boolean
  category: string
  userId: string
  user: {
    id: string
    username: string
    displayName: string
    avatar: string | null
    isVerified: boolean
  }
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const user = await auth()
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      minPrice: true,
      maxPrice: true,
      contactPrice: true,
      category: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
        },
      },
    },
  })

  const formatPrice = (listing: ListingDetail) => {
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


  if (!listing) {
    notFound()
  }

  // Check if there are any messages between the users
  const messages = user
    ? await prisma.message.findFirst({
        where: {
          OR: [
            { AND: [{ senderId: user.id }, { receiverId: listing.userId }] },
            { AND: [{ senderId: listing.userId }, { receiverId: user.id }] }
          ]
        },
      })
    : null

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
            <div className="mb-6">
              <Image
                src="/placeholder.svg"
                alt={listing.title}
                width={800}
                height={400}
                className="w-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                {listing.category}
              </Badge>
              <p className="text-gray-300">{listing.description}</p>
                <div className="text-xl font-semibold">
                {formatPrice(listing)}
                </div>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              <Reviews listingId={listing.id} />
            </div>
          </div>
          <div>
            <div className="bg-gray-900 p-6 rounded-lg mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Image
                  src={listing.user.avatar || "/placeholder.svg"}
                  alt={listing.user.displayName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{listing.user.displayName}</h3>
                  <p className="text-sm text-gray-400">@{listing.user.username}</p>
                </div>
              </div>
              {user && user.id !== listing.userId && (
                <>
                  {messages ? (
                    <Chat chatId={listing.userId} listingId={listing.id} />
                  ) : (
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={async () => {
                        const response = await fetch("/api/chat", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ receiverId: listing.userId }),
                        })
                        if (response.ok) {
                            await response.json()
                          window.location.reload()
                        }
                      }}
                    >
                      Start Chat
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


