import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination"

interface SearchPaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export function SearchPagination({ currentPage, totalPages, onPageChange }: SearchPaginationProps) {
	return (
		<Pagination>
			<PaginationContent>
				{currentPage > 1 && (
					<PaginationItem>
						<PaginationPrevious href="#" onClick={() => onPageChange(currentPage - 1)} />
					</PaginationItem>
				)}
				
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
					<PaginationItem key={page}>
						<PaginationLink
							href="#"
							onClick={() => onPageChange(page)}
							isActive={currentPage === page}
						>
							{page}
						</PaginationLink>
					</PaginationItem>
				))}

				{currentPage < totalPages && (
					<PaginationItem>
						<PaginationNext href="#" onClick={() => onPageChange(currentPage + 1)} />
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	)
}