"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { debounce } from "lodash"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      if (value) {
        newSearchParams.set("search", value)
      } else {
        newSearchParams.delete("search")
      }
      newSearchParams.delete("page")
      router.push(`/listings?${newSearchParams.toString()}`)
    }, 300),
    [router],
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchTerm, debouncedSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    debouncedSearch(searchTerm)
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4 sm:mb-6">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm sm:text-base h-9 sm:h-10 bg-black/50 border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-gray-700"
        />
      </div>
      <Button type="submit" variant="secondary" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}

