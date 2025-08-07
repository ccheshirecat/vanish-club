"use client";

import Link from "next/link"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "@/components/mobile-menu"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

function NavbarContent() {
	const { user, logout, isLoading } = useAuth()

	return (
		<>
			<div className="hidden md:flex items-center space-x-6">
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
			<div className="hidden md:flex items-center space-x-4">
				{isLoading ? (
					<div className="w-24">
						<LoadingSpinner />
					</div>
				) : user ? (
					<>
						<span className="text-sm text-gray-300">Welcome, {user.displayName}</span>
						{user.isVendor && (
							<Link href="/vendor/dashboard">
								<Button variant="outline" className="text-sm border-gray-800">
									Vendor Dashboard
								</Button>
							</Link>
						)}
						<Button variant="outline" className="text-sm border-gray-800" onClick={logout}>
							<LogOut className="mr-2 h-4 w-4" />
							Logout
						</Button>
					</>
				) : (
					<>
						<Link href="/auth">
							<Button variant="outline" className="text-sm border-gray-800">
								Login / Register
							</Button>
						</Link>
						<Link href="/become-vendor">
							<Button variant="outline" className="text-sm border-gray-800">
								Become a Vendor
							</Button>
						</Link>
					</>
				)}
			</div>
		</>
	)

}

export function Navigation() {
	return (
		<nav className="border-b border-gray-900/50 backdrop-blur-xl bg-black/50 sticky top-0 z-50">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link
						href="/"
						className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent"
					>
						wrkx.app
					</Link>
					<NavbarContent />
					<div className="md:hidden">
						<Button variant="ghost" size="icon" className="text-gray-400" id="mobile-menu-button">
							<Menu className="h-6 w-6" />
						</Button>
					</div>
				</div>
			</div>
			<MobileMenu />
		</nav>
	)
}