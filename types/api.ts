// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string
  email: string
  username: string
  role: 'user' | 'admin'
  isVerified: boolean
  studentEmail?: string
  studentEmailVerifiedAt?: string
  lastLoginAt?: string
  isSuspended: boolean
  createdAt: string
  updatedAt: string
}

export interface SignInPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  _id: string
  userId: string
  username: string
  fullName: string
  bio?: string
  avatar?: string
  avatarPublicId?: string
  department?: string
  year?: number
  accentColor?: string
  canvasLayout: string[]
  serviceCategories: string[]
  isPublic: boolean
  isFeatured: boolean
  completenessScore: number
  viewCount: number
  lastActiveAt?: string
  createdAt: string
  updatedAt: string
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface Service {
  _id: string
  profileId: string
  title: string
  category: string
  description?: string
  startingPrice?: number
  currency: string
  isNegotiable: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface GalleryItem {
  _id?: string
  publicId: string
  url: string
  caption?: string
  order: number
}

export interface ProjectLink {
  label: string
  url: string
  type: 'live' | 'github' | 'figma' | 'case_study' | 'video' | 'other'
}

export interface Project {
  _id: string
  profileId: string
  title: string
  slug: string
  tagline?: string
  coverUrl?: string
  coverPublicId?: string
  description?: string
  descriptionHtml?: string
  gallery: GalleryItem[]
  links: ProjectLink[]
  techStack: string[]
  isPublished: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// ─── Link ─────────────────────────────────────────────────────────────────────

export interface Link {
  _id: string
  profileId: string
  label: string
  url: string
  iconKey?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// ─── Story ────────────────────────────────────────────────────────────────────

export interface Story {
  _id: string
  profileId: string
  title: string
  slug: string
  coverUrl?: string
  coverPublicId?: string
  excerpt?: string
  body?: string
  bodyHtml?: string
  readingTimeMinutes: number
  isPublished: boolean
  publishedAt?: string
  viewCount?: number
  createdAt: string
  updatedAt: string
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface Contact {
  _id: string
  profileId: string
  type: string
  label?: string
  value: string
  isPrimary: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// ─── Resume ───────────────────────────────────────────────────────────────────

export interface ResumeFile {
  _id: string
  profileId: string
  url: string
  publicId: string
  filename: string
  size: number
  createdAt: string
  updatedAt: string
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export interface CanvasResponse {
  profile: Profile & {
    username: string
    fullName: string
    isVerified: boolean
  }
  services: Service[]
  projects: Project[]
  links: Link[]
  stories: Story[]
  resume: ResumeFile | null
  contacts: Contact[]
}

// ─── Discovery ───────────────────────────────────────────────────────────────

export interface DiscoveryProfile {
  _id: string
  username: string
  fullName: string
  bio?: string
  avatar?: string
  department?: string
  year?: number
  serviceCategories: string[]
  isVerified: boolean
  completenessScore: number
  topProject?: { title: string; coverUrl?: string; slug: string }
}

export interface DiscoveryResult {
  profiles: DiscoveryProfile[]
  nextCursor?: string
  total: number
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsDayStat {
  date: string
  views: number
}

export interface AnalyticsOverview {
  totalViews: number
  viewsLast7d: number
  viewsLast30d: number
  outreachClicksLast30d: number
  outreachBreakdown: Array<{ type: string; count: number }>
  topProjects: Array<{ title: string; slug: string; coverUrl?: string }>
  topStories: Array<{ title: string; slug: string; viewCount: number; publishedAt?: string }>
}

// ─── Saved ────────────────────────────────────────────────────────────────────

export interface SavedProfile {
  _id: string
  profile: DiscoveryProfile
  createdAt: string
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export interface Report {
  _id: string
  reporterId: string
  reporterUsername?: string
  targetProfileId: string
  targetUserId?: string
  targetUsername?: string
  targetProfile?: { username: string; fullName: string }
  reason: string
  description?: string
  details?: string
  status: 'pending' | 'reviewed' | 'dismissed'
  reviewedAt?: string
  createdAt: string
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadSignature {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  uploadPreset?: string
}

// ─── API envelope ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: { code: string; message: string; details?: unknown[] }
}
