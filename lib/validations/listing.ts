import { z } from "zod"

export const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  category: z.string(),
  priceType: z.enum(["range", "contact", "bidding"]),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  images: z.array(z.string().url()).max(10),
})

export const updateListingSchema = createListingSchema.partial()

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
  vendorId: z.string(),
  listingId: z.string(),
})

export const createDisputeSchema = z.object({
  reason: z.string().min(20).max(2000),
  evidence: z.array(z.string().url()).max(5),
  listingId: z.string(),
  vendorId: z.string(),
})

