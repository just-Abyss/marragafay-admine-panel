// TypeScript interfaces matching Supabase structure

export type PaymentStatus = "paid" | "deposit" | "unpaid"

export interface Driver {
  id: string
  name: string
  phone: string
  vehicle: string
  is_available: boolean
}

export interface Resource {
  id: string
  type: "quad" | "camel" | "buggy" | "horse" | "balloon"
  name: string
  total_count: number
}

export interface Booking {
  id: string
  name: string
  email: string
  phone_number: string
  package_title: string
  status: "pending" | "confirmed" | "cancelled"
  date: string
  guests: number
  adults: number
  children: number
  total_price: number
  created_at?: string
  notes?: string
  payment_status: PaymentStatus
  amount_paid: number
  remaining_balance: number
  driver_id?: string
  driver_name?: string
  driver?: string
  pickup_time?: string
  pickup_location?: string
  activity_type?: string
  deposit_amount?: number
}

export interface Package {
  id: string
  title: string
  description: string
  price: number
  duration: string
  includes?: string[]
  tier?: "basic" | "premium" | "vip"
  is_active: boolean
  image_url?: string
}

export interface DashboardStats {
  total_revenue: number
  active_bookings: number
  pending_inquiries: number
  revenue_change: number
  bookings_change: number
  inquiries_change: number
  cash_collected: number
  pending_balance: number
}

export interface ScheduleItem {
  id: string
  time: string
  name: string
  package_title: string
  guests: number
  driver_name?: string
  pickup_location?: string
  phone_number?: string
  special_notes?: string
  booking_id?: string
  activity_type?: string
  payment_status?: PaymentStatus
  driver_phone?: string
}

export interface BookingTrend {
  date: string
  bookings: number
  revenue: number
}

export type ViewMode = "table" | "kanban" | "calendar" | "operations" | "manifest"
export type BookingStatus = "pending" | "confirmed" | "cancelled"

export interface Activity {
  id: string
  title: string
  description: string
  price: number
  duration: string
  image_url?: string
  active: boolean
  resource_type: "quad" | "camel" | "buggy" | "horse" | "balloon" | "none"
  capacity_per_session: number
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  status: "published" | "draft"
  author: string
}

export interface Testimonial {
  id: string
  customer_name: string
  content: string
  rating: number
  date: string
  status: "approved" | "pending" | "rejected"
}

export interface Pricing {
  id: string
  activity_name: string
  price: number
  currency: string
  duration?: string
  type: 'activity' | 'pack'
  created_at?: string
  updated_at?: string
}

export interface Review {
  id: string
  name: string
  email?: string
  rating: number
  comment: string
  status: "approved" | "pending" | "rejected"
  created_at: string
  updated_at?: string
  image_url?: string
  images?: string[]
}
