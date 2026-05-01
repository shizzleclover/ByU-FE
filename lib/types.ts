// User types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  role?: 'student' | 'admin'
  createdAt: string
  updatedAt: string
}

// Service/Listing types
export interface Service {
  id: string
  title: string
  description: string
  category: string
  provider: User
  contact: string
  availability: string
  price?: number
  images?: string[]
  rating?: number
  views?: number
  createdAt: string
  updatedAt: string
}

// Project types
export interface Project {
  id: string
  title: string
  description: string
  category: string
  creator: User
  images?: string[]
  status: 'active' | 'completed' | 'paused'
  teamMembers?: User[]
  views?: number
  createdAt: string
  updatedAt: string
}

// Story types
export interface Story {
  id: string
  title: string
  content: string
  author: User
  images?: string[]
  publishedAt: string
  readingTime?: number
  featured?: boolean
  createdAt: string
  updatedAt: string
}

// Message/Canvas types
export interface Message {
  id: string
  content: string
  author: User
  threadId?: string
  timestamp: string
  read: boolean
  createdAt: string
}

// Category types
export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}
