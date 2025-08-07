import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Wallet, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reviews } from "@/components/reviews"
import { auth } from "@/lib/auth"

export default async function VendorProfilePage({ params }: { params: { id: string } }) {
	const user = await auth()
	const vendor = await prisma.user.findUnique({
		where: { id: params.id, isVendor: true },
		include: {
			listings: {
				orderBy: { createdAt: "desc" },
				take: 6,
			},
			_count: {
				select: {
					listings: true,
					reviews: true,
					vendorDisputes: true,
				},
			},
		},
	})

	if (!vendor) {
		notFound()
	}

	const formatPrice = (listing: any) => {
		if (listing.contactPrice) return "Contact for Price"
		if (listing.minPrice && listing.maxPrice) {
			return `$${listing.minPrice.toLocaleString()} - $${listing.maxPrice.toLocaleString()}`
		}
		if (listing.minPrice) return `From $${listing.minPrice.toLocaleString()}`
		if (listing.maxPrice) return `Up to $${listing.maxPrice.toLocaleString()}`
		return "Price not specified"
	}

	return (
		<div className="min-h-screen bg-black">
			<div className="container mx-auto px-4 py-8">
				<Card className="bg-gray-900/50 border-gray-800 mb-8">
					<div className="p-6 space-y-6">
						<div className="flex items-center gap-6">
							<Avatar className="w-20 h-20">
								{vendor.avatar && (
									<img 
										src={vendor.avatar} 
										alt={vendor.displayName} 
										className="w-full h-full object-cover rounded-full"
									/>
								)}
							</Avatar>
							<div>
								<div className="flex items-center gap-2 mb-1">
									<h1 className="text-2xl font-bold text-gray-100">{vendor.displayName}</h1>
									{vendor.isVerified && <Shield className="w-5 h-5 text-blue-400" />}
								</div>
								<p className="text-gray-400">@{vendor.username}</p>
								<div className="flex items-center gap-2 mt-2">
									<Star className="w-4 h-4 text-yellow-400" />
									<span className="text-gray-300">
										{vendor.reputation ? vendor.reputation.toFixed(1) : 'New'} 
										<span className="text-gray-500 text-sm ml-1">
											({vendor._count.reviews} reviews)
										</span>
									</span>
								</div>
							</div>
							{user && user.id !== vendor.id && (
								<Button className="ml-auto" variant="secondary">
									<MessageSquare className="w-4 h-4 mr-2" />
									Contact Vendor
								</Button>
							)}
						</div>

						{vendor.paymentMethods && (
							<div className="border-t border-gray-800 pt-4">
								<h2 className="text-sm font-semibold text-gray-300 mb-2">Accepted Payment Methods</h2>
								<div className="flex flex-wrap gap-2">
									{(vendor.paymentMethods as string[]).map((method, i) => (
										<Badge key={i} variant="outline" className="bg-gray-800/50">
											{method}
										</Badge>
									))}
								</div>
							</div>
						)}

						<div className="border-t border-gray-800 pt-4">
							<div className="grid grid-cols-3 gap-4 text-center">
								<div>
									<div className="text-xl font-semibold text-gray-100">
										{vendor._count.listings}
									</div>
									<div className="text-sm text-gray-400">Listings</div>
								</div>
								<div>
									<div className="text-xl font-semibold text-gray-100">
										{vendor._count.reviews}
									</div>
									<div className="text-sm text-gray-400">Reviews</div>
								</div>
								<div>
									<div className="text-xl font-semibold text-gray-100">
										{vendor._count.vendorDisputes}
									</div>
									<div className="text-sm text-gray-400">Resolved Disputes</div>
								</div>
							</div>
						</div>
					</div>
				</Card>

				<div className="space-y-8">
					<section>
						<h2 className="text-xl font-bold text-gray-100 mb-4">Recent Listings</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{vendor.listings.map((listing) => (
								<Card key={listing.id} className="bg-gray-900/50 border-gray-800">
									<div className="p-4">
										<h3 className="font-semibold text-gray-100 mb-2">{listing.title}</h3>
										<p className="text-sm text-gray-400 mb-4 line-clamp-2">
											{listing.description}
										</p>
										<div className="text-lg font-semibold text-gray-100">
											{formatPrice(listing)}
										</div>
									</div>
								</Card>
							))}
						</div>
					</section>

					<section>
						<h2 className="text-xl font-bold text-gray-100 mb-4">Reviews</h2>
						<Reviews vendorId={vendor.id} />
					</section>
				</div>
			</div>
		</div>
	)
}