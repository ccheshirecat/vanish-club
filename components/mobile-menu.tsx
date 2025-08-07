"use client"

import { useEffect } from "react"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export function MobileMenu() {
  const { user, logout, isLoading } = useAuth()

  useEffect(() => {
    const mobileMenuButton = document.getElementById("mobile-menu-button")
    const mobileMenu = document.getElementById("mobile-menu")

    const toggleMenu = () => {
      mobileMenu?.classList.toggle("hidden")
    }

    mobileMenuButton?.addEventListener("click", toggleMenu)

    return () => {
      mobileMenuButton?.removeEventListener("click", toggleMenu)
    }
  }, [])

  return (
    <div id="mobile-menu" className="md:hidden hidden border-t border-gray-900/50">
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div className="flex flex-col space-y-3">
          <Link href="/listings" className="text-sm hover:text-gray-200 transition-colors">
            Listings
          </Link>
          <Link href="/vendors" className="text-sm hover:text-gray-200 transition-colors">
            Vendors
          </Link>
          <Link href="/about" className="text-sm hover:text-gray-200 transition-colors">
            About
          </Link>
        </div>
        <div className="flex flex-col space-y-3 pt-3 border-t border-gray-900/50">
          {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
          ) : user ? (
            <>
              <span className="text-sm text-gray-300">Welcome, {user.displayName}</span>
              {user.isVendor && (
                <Link href="/vendor/dashboard">
                  <Button variant="outline" className="w-full text-sm border-gray-800">
                    Vendor Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="w-full text-sm border-gray-800" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="outline" className="w-full text-sm border-gray-800">
                  Login / Register
                </Button>
              </Link>
              <Link href="/become-vendor">
                <Button variant="outline" className="w-full text-sm border-gray-800">
                  Become a Vendor
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

