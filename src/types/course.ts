// Course types based on API schema

export type CourseType = 'article' | 'dark_horse' | 'signal' | 'loop_comm'

export interface RequiredGroup {
  id: number
  name: string
}

export interface Course {
  id: number
  course_type: CourseType
  name: string
  description: string
  content: string
  isUnlocked: boolean
  required_groups: RequiredGroup[]
  // Additional fields for UI
  duration?: string
  level?: string
  videoUrl?: string
  category?: string
  link?: string
  image?: string
}

export interface PermissionGroup {
  id: number
  name: string
  created_at: string
  description?: string
  hidden?: boolean
}

export interface CoursePackage {
  id: number
  group_id: number
  duration_days: number
  price: number
  currency: string
  description?: string
}

export interface PermissionGroupWithPackages {
  group: PermissionGroup
  packages: CoursePackage[]
}

export interface Order {
  id: number
  user_id: number
  package_id: number
  amount: number
  paymentAmount: number
  currency: string
  status: 'pending' | 'confirmed' | 'closed'
  created_at: string
  updated_at: string
  // Optional fields present for pending orders
  paymentAddress?: string
  remainingTimeSeconds?: number
}

export interface CreateOrderResponse {
  message: string
  orderId: number
  amount: number
  paymentAmount: number
  currency: string
  paymentAddress: string
}
