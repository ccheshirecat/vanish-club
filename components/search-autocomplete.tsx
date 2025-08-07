"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { debounce } from "lodash"

export function SearchAutocomplete() {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchSuggestions = async (term: string) => {
    if (term.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/suggestions?term=${encodeURIComponent(term)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300)

  useEffect(() => {
    debouncedFetchSuggestions(searchTerm)
    return () => {
      debouncedFetchSuggestions.cancel()
    }
  }, [searchTerm, debouncedFetchSuggestions]) // Added debouncedFetchSuggestions to dependencies

  const handleSearch = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`)
    setSuggestions([])
  }

  return (
    <div className="relative">
      <div className="flex">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-900 border-gray-800 text-gray-100"
        />
        <Button onClick={() => handleSearch(searchTerm)} className="ml-2 bg-gray-800 hover:bg-gray-700">
          <Search className="h-4 w-4 text-gray-300" />
        </Button>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-900 border border-gray-800 rounded-md mt-1 max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
              onClick={() => {
                setSearchTerm(suggestion)
                handleSearch(suggestion)
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {isLoading && <div className="absolute right-12 top-3 text-gray-400">Loading...</div>}
    </div>
  )
}

