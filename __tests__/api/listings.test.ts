import { describe, it, expect, beforeEach } from "vitest"
import { createMocks } from "node-mocks-http"
import { GET, POST } from "@/app/api/listings/route"
import { prisma } from "@/lib/prisma"
import { createListingSchema } from "@/lib/validations/listing"

describe("Listings API", () => {
  beforeEach(async () => {
    await prisma.listing.deleteMany()
  })

  describe("GET /api/listings", () => {
    it("returns listings with pagination", async () => {
      const { req } = createMocks({
        method: "GET",
        query: {
          page: "1",
          limit: "10",
        },
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty("listings")
      expect(data).toHaveProperty("pagination")
    })
  })

  describe("POST /api/listings", () => {
    it("creates a new listing with valid data", async () => {
      const listingData = {
        title: "Test Listing",
        description: "Test description that meets minimum length",
        category: "digital-services",
        priceType: "range",
        priceMin: 100,
        priceMax: 200,
        images: ["https://example.com/image.jpg"],
      }

      const { req } = createMocks({
        method: "POST",
        body: listingData,
      })

      const validatedData = createListingSchema.parse(listingData)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty("id")
      expect(data.title).toBe(listingData.title)
    })
  })
})

