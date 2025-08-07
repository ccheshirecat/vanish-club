"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchPagination } from "@/components/ui/search-pagination"

import { useNotification } from "@/lib/notification-context"
import { Search } from "lucide-react"
import Link from "next/link"

interface Listing {
  id: string
  title: string
  description: string
  category: string
  minPrice: number | null
  maxPrice: number | null
  contactPrice: boolean
  vendor: {
    id: string
    username: string
    displayName: string
    avatar: string
  }
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showNotification } = useNotification()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [results, setResults] = useState<Listing[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (searchTerm) {
      performSearch()
    }
  }, [searchTerm, searchParams]) // Added searchTerm to dependencies

  const performSearch = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}&category=${category}&page=${pagination.page}&limit=${pagination.limit}`,
      )
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
        setPagination(data.pagination)
      } else {
        throw new Error("Failed to fetch search results")
      }
    } catch (error) {
      console.error("Error searching listings:", error)
      showNotification("Failed to fetch search results", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchTerm)}${category ? `&category=${category}` : ""}`)
  }

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(searchTerm)}${category ? `&category=${category}` : ""}&page=${newPage}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Search Listings</h1>
      <form onSubmit={handleSearch} className="mb-8 flex space-x-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search listings..."
          className="flex-grow bg-gray-900 border-gray-800 text-gray-100"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px] bg-gray-900 border-gray-800 text-gray-100">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem> {/* Changed default value */}
            <SelectItem value="digital-services">Digital Services</SelectItem>
            <SelectItem value="creative-works">Creative Works</SelectItem>
            <SelectItem value="consulting">Consulting</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="writing-translation">Writing & Translation</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </form>

      {isLoading ? (
        <p className="text-center text-gray-400">Loading results...</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((listing) => (
            <Card key={listing.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">{listing.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{listing.description.slice(0, 100)}...</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                  {listing.contactPrice
                    ? "Contact for Price"
                    : listing.minPrice && listing.maxPrice
                    ? `$${listing.minPrice.toLocaleString()} - $${listing.maxPrice.toLocaleString()}`
                    : listing.minPrice
                    ? `From $${listing.minPrice.toLocaleString()}`
                    : listing.maxPrice
                    ? `Up to $${listing.maxPrice.toLocaleString()}`
                    : "Price not specified"}
                  </span>
                  <span className="text-sm text-gray-500">{listing.category}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <img
                    src={listing.vendor.avatar || "/placeholder.svg"}
                    alt={listing.vendor.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-400">{listing.vendor.displayName}</span>
                </div>
                <Link href={`/listings/${listing.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No results found.</p>
      )}

        {results.length > 0 && (
        <div className="mt-8">
            <SearchPagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
        </div>
        )}
    </div>
  )
}

