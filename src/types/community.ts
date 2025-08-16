export interface Community {
  id: string
  name: string
  description: string
  content: string // This will contain a URL to be extracted
  icon?: string // Optional icon/image for the community
  category?: string
  isActive?: boolean
  createdAt?: string
}
