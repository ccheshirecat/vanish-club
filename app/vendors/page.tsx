import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Wallet } from "lucide-react"
import Link from "next/link"

export default async function VendorsPage() {
	const vendors = await prisma.user.findMany({
		where: { isVendor: true },
		select: {
			id: true,
			username: true,
			displayName: true,
			avatar: true,
			createdAt: true,
			isVerified: true,
			reputation: true,
			paymentMethods: true,
			_count: {
				select: {
					listings: true,
					reviews: true,
					vendorDisputes: true
				}
			}
		}
	})

	return (
		<div className="min-h-screen bg-black">
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6 text-gray-100">Marketplace Vendors</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{vendors.map((vendor) => (
						<Link href={`/vendors/${vendor.id}`} key={vendor.id}>
							<Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300">
								<div className="p-6 space-y-4">
									<div className="flex items-center gap-4">
										<Avatar className="w-12 h-12">
											{vendor.avatar && (
												<img 
													src={vendor.avatar} 
													alt={vendor.displayName} 
													className="w-full h-full object-cover rounded-full"
												/>
											)}
										</Avatar>
										<div>
											<div className="flex items-center gap-2">
												<h2 className="font-semibold text-gray-100">{vendor.displayName}</h2>
												{vendor.isVerified && (
													<Shield className="w-4 h-4 text-blue-400" />
												)}
											</div>
											<p className="text-sm text-gray-500">@{vendor.username}</p>
										</div>
									</div>
									
									<div className="flex items-center gap-2">
										<Star className="w-4 h-4 text-yellow-400" />
										<span className="text-gray-300">
											{vendor.reputation ? vendor.reputation.toFixed(1) : 'New'} 
											<span className="text-gray-500 text-sm ml-1">
												({vendor._count.reviews} reviews)
											</span>
										</span>
									</div>

									{vendor.paymentMethods && (
										<div className="flex items-center gap-2">
											<Wallet className="w-4 h-4 text-gray-400" />
											<div className="flex flex-wrap gap-1">
												{(vendor.paymentMethods as string[]).map((method, i) => (
													<Badge key={i} variant="outline" className="bg-gray-800/50 text-gray-300">
														{method}
													</Badge>
												))}
											</div>
										</div>
									)}

									<div className="flex justify-between text-sm">
										<span className="text-gray-400">{vendor._count.listings} listings</span>
										<span className="text-gray-400">
											{vendor._count.vendorDisputes} resolved disputes
										</span>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}