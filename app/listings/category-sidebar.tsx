"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

const categories = [
	{ id: "all", name: "All Categories" },
	{ id: "drugs", name: "Drugs" },
	{ id: "vapes", name: "Vapes" },
	{ id: "financial", name: "Financial Services" },
	{ id: "digital", name: "Digital Goods" },
	{ id: "other", name: "Other" },
]

export function CategorySidebar() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const currentCategory = searchParams.get("category") || "all"
	const [isOpen, setIsOpen] = useState(false)

	const handleCategoryClick = (categoryId: string) => {
		const params = new URLSearchParams(searchParams)
		if (categoryId === "all") {
			params.delete("category")
		} else {
			params.set("category", categoryId)
		}
		params.delete("page")
		router.push(`/listings?${params.toString()}`)
	}

	return (
		<div className="w-full md:w-64">
			<Button
				variant="outline"
				className="w-full flex justify-between items-center md:hidden mb-4"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span>Categories</span>
				{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
			</Button>
			
			<div className={`${isOpen ? "block" : "hidden"} md:block space-y-1`}>
				{categories.map((category) => (
					<Button
						key={category.id}
						variant={currentCategory === category.id ? "default" : "ghost"}
						className="w-full justify-start text-left"
						onClick={() => handleCategoryClick(category.id)}
					>
						{category.name}
					</Button>
				))}
			</div>
		</div>
	)
}