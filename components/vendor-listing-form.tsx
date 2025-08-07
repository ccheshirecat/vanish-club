"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const categories = [
	{ id: "drugs", name: "Drugs", description: "Methamphetamine, ecstasy, cannabis, etc." },
	{ id: "vapes", name: "Vapes", description: "Vaping devices, lana pods, etc" },
	{ id: "financial", name: "Financial Services", description: "Moneylenders, bank loan rentals, etc" },
]

const listingSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format").optional(),
	maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format").optional(),
	contactPrice: z.boolean().default(false),
	category: z.string().min(1, "Please select a category"),
})

export function VendorListingForm() {
	const [isLoading, setIsLoading] = useState(false)
	const { toast } = useToast()
	const router = useRouter()

	const form = useForm<z.infer<typeof listingSchema>>({
		resolver: zodResolver(listingSchema),
		defaultValues: {
			title: "",
			description: "",
			minPrice: "",
			maxPrice: "",
			contactPrice: false,
			category: "",
		},
	})

	async function onSubmit(data: z.infer<typeof listingSchema>) {
		setIsLoading(true)
		try {
			const response = await fetch("/api/vendor/listings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new Error("Failed to create listing")
			}

			toast({
				title: "Success",
				description: "Your listing has been created",
			})
			
			router.refresh()
			form.reset()
		} catch (error) {
			console.error("Error creating listing:", error)
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to create listing",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Card className="bg-gray-900/50 border-gray-800 p-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-200">Title</FormLabel>
								<FormControl>
									<Input 
										placeholder="Enter listing title" 
										className="bg-gray-800/50 border-gray-700 text-gray-200"
										{...field} 
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="category"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-200">Category</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-200">
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
									</FormControl>
									<SelectContent className="bg-gray-800 border-gray-700">
										{categories.map((category) => (
											<SelectItem 
												key={category.id} 
												value={category.id}
												className="text-gray-200 focus:bg-gray-700 focus:text-gray-200"
											>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-200">Description</FormLabel>
								<FormControl>
									<Textarea 
										placeholder="Enter listing description" 
										className="bg-gray-800/50 border-gray-700 text-gray-200"
										{...field} 
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="minPrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-200">Minimum Price</FormLabel>
									<FormControl>
										<Input 
											type="number" 
											step="0.01" 
											placeholder="0.00" 
											className="bg-gray-800/50 border-gray-700 text-gray-200"
											{...field} 
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="maxPrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-gray-200">Maximum Price</FormLabel>
									<FormControl>
										<Input 
											type="number" 
											step="0.01" 
											placeholder="0.00" 
											className="bg-gray-800/50 border-gray-700 text-gray-200"
											{...field} 
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="contactPrice"
							render={({ field }) => (
								<FormItem className="flex items-center space-x-2">
									<FormControl>
										<input
											type="checkbox"
											checked={field.value}
											onChange={field.onChange}
											className="bg-gray-800/50 border-gray-700"
										/>
									</FormControl>
									<FormLabel className="text-gray-200">Contact for Price</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button 
						type="submit" 
						className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200"
						disabled={isLoading}
					>
						{isLoading ? "Creating..." : "Create Listing"}
					</Button>
				</form>
			</Form>
		</Card>
	)
}