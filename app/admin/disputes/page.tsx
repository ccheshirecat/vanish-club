export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { format } from "date-fns"

export default async function AdminDisputesPage() {
	const user = await auth()
	if (!user?.isAdmin) {
		redirect("/")
	}

	const disputes = await prisma.dispute.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			user: {
				select: {
					id: true,
					username: true,
					displayName: true,
					avatar: true,
				},
			},
			vendor: {
				select: {
					id: true,
					username: true,
					displayName: true,
					avatar: true,
				},
			},
			listing: {
				select: {
					id: true,
					title: true,
				},
			},
		},
	})

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold text-gray-100 mb-6">Dispute Management</h1>
			
			<div className="space-y-4">
				{disputes.map((dispute) => (
					<Card key={dispute.id} className="bg-gray-900/50 border-gray-800">
						<div className="p-6 space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<Badge
										variant={dispute.status === "OPEN" ? "destructive" : "secondary"}
										className="uppercase"
									>
										{dispute.status}
									</Badge>
									<span className="text-sm text-gray-400">
										Opened {format(new Date(dispute.createdAt), "PPp")}
									</span>
								</div>
								<Button variant="outline" size="sm">
									View Details
								</Button>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="text-sm text-gray-400">User</div>
									<div className="flex items-center gap-2">
										<Avatar className="w-8 h-8">
											{dispute.user.avatar && (
												<img
													src={dispute.user.avatar}
													alt={dispute.user.displayName}
													className="w-full h-full object-cover rounded-full"
												/>
											)}
										</Avatar>
										<div>
											<div className="text-sm font-medium text-gray-100">
												{dispute.user.displayName}
											</div>
											<div className="text-xs text-gray-400">
												@{dispute.user.username}
											</div>
										</div>
									</div>
								</div>

								<div className="space-y-2">
									<div className="text-sm text-gray-400">Vendor</div>
									<div className="flex items-center gap-2">
										<Avatar className="w-8 h-8">
											{dispute.vendor.avatar && (
												<img
													src={dispute.vendor.avatar}
													alt={dispute.vendor.displayName}
													className="w-full h-full object-cover rounded-full"
												/>
											)}
										</Avatar>
										<div>
											<div className="text-sm font-medium text-gray-100">
												{dispute.vendor.displayName}
											</div>
											<div className="text-xs text-gray-400">
												@{dispute.vendor.username}
											</div>
										</div>
									</div>
								</div>
							</div>

							<div>
								<div className="text-sm text-gray-400 mb-1">Listing</div>
								<div className="text-sm text-gray-100">{dispute.listing.title}</div>
							</div>

							<div>
								<div className="text-sm text-gray-400 mb-1">Reason</div>
								<div className="text-sm text-gray-100">{dispute.reason}</div>
							</div>

							{dispute.evidence && (
								<div>
									<div className="text-sm text-gray-400 mb-1">Evidence</div>
									<div className="grid grid-cols-4 gap-2">
										{JSON.parse(dispute.evidence).map((url: string, i: number) => (
											<img
												key={i}
												src={url}
												alt={`Evidence ${i + 1}`}
												className="w-full h-24 object-cover rounded"
											/>
										))}
									</div>
								</div>
							)}

							{dispute.status === "OPEN" && (
								<div className="flex gap-2">
									<Button variant="destructive" size="sm">
										Resolve for User
									</Button>
									<Button variant="outline" size="sm">
										Resolve for Vendor
									</Button>
								</div>
							)}
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}