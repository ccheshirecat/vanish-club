import { Suspense } from "react"
import { ListingsGrid } from "./listings-grid"
import { SearchBar } from "./search-bar"
import { CategorySidebar } from "./category-sidebar"
import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { Prisma } from "@prisma/client"

const getListings = cache(async (page: number, category?: string, search?: string) => {
  const where: Prisma.ListingWhereInput = {
    ...(category && category !== "all" && { category }),
    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        },
        {
          description: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        }
      ]
    })
  }

  const listings = await prisma.listing.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      minPrice: true,
      maxPrice: true,
      contactPrice: true,
      category: true,
      images: true,
      variations: true,
      visibility: true,
      createdAt: true,
      updatedAt: true,
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

    skip: (page - 1) * 20,
    take: 20,
    orderBy: { createdAt: "desc" },
  })

  const total = await prisma.listing.count({ where })

  return {
    listings,
    pagination: {
      page,
      total,
      pages: Math.ceil(total / 20),
    },
  }
})

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; search?: string }
}) {
  const page = Number(searchParams.page) || 1
  const { category, search } = searchParams

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-100">Browse Listings</h1>
          <p className="text-gray-400">Find what you're looking for</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">
            <CategorySidebar />
          </aside>
          
          <div className="flex-1 min-w-0">
            <SearchBar />
            <Suspense 
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-400">Loading listings...</div>
                </div>
              }
            >
              <ListingsGrid getListings={() => getListings(page, category, search)} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}


