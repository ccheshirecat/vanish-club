export type User = {
  id: string
  username: string
  displayName: string
  avatar?: string | null
  email: string
  telegramId?: string | null
  createdAt: Date
  updatedAt: Date
  isVendor: boolean
  isAdmin: boolean
}

export type Listing = {
  id: string
  title: string
  description: string
  minPrice?: number | null
  maxPrice?: number | null
  contactPrice: boolean
  category: string
  images: any[]
  variations?: any | null
  visibility: string
  createdAt: Date
  updatedAt: Date
  userId: string
  user: {
    id: string
    username: string
    displayName: string
    avatar: string | null
    isVerified: boolean
  }
}


export type Message = {
  id: string
  content: string
  createdAt: Date
  senderId: string
  receiverId: string
  expiresAt?: Date | null
}

export type Review = {
  id: string
  rating: number
  comment?: string | null
  createdAt: Date
  userId: string
  vendorId: string
  listingId: string
}


