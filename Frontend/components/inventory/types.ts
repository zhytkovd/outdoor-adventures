export type InventoryPage = 'dashboard' | 'gear' | 'categories' | 'reports'
  | 'gear-details' | 'add-gear' | 'edit-gear'

export type RentalStatus = 'Trip Reserved' | 'Active' | 'Due Soon' | 'Overdue' | 'Returned'
export type GearStatus = 'Available' | 'Rented' | 'Maintenance' | 'Inactive'
type UserRole = 'Student' | 'Staff' | 'Admin'
type UserStatus = 'Active' | 'Inactive'
export type AccessLevel = 'Everyone' | 'Staff only' | 'Faculty only'


export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  rentals: number
  joined: string
}

export interface Category {
  id: number
  name: string
  description: string
  itemCount: number
  icon: string
  subcategories: string[]
}

export interface Rental {
  id: number
  student: string
  gear: string
  startDate: string
  dueDate: string
  status: RentalStatus
  durationDays: number
}

export interface Gear {
  id: number
  name: string
  category: string
  subcategory: string
  size: string
  purchaseDate: string
  condition: string
  status: GearStatus
  description: string
  access: AccessLevel
  totalQuantity: number
  unitCost: number
  expirationDate: string
  maintenanceCount: number
  needsCleaning: boolean
  deliveryAllowed: boolean
  isHighRisk: boolean
}
