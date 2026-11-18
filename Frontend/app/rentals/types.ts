export type UserRole = 'user' | 'staff' | 'logistics';
// Matches users.role in Backend/database/schema.sql.
// Only 'oap' (Outdoor Adventure Program staff) can manage reservations and gear;
// 'faculty' and 'staff' are college employees who rent gear.
export type BereaRole = 'student' | 'faculty' | 'staff' | 'oap';

export const ROLE_LABELS: Record<BereaRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  staff: 'Staff',
  oap: 'OAP Staff',
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role as BereaRole] ?? role;
}
export type ReservationStatus = 'Pending' | 'Approved' | 'Checked Out' | 'Returned' | 'Denied';
export type Fulfillment = 'Pickup' | 'Delivery';
export type GearCondition = 'Good' | 'Minor wear' | 'Damaged';

export interface UserInfo {
  userId: string;
  bNumber: string;
  email: string;
  fullName: string;
  userType: BereaRole;
}

export interface Category {
  categoryId: string;
  name: string;
  description: string;
}

export interface GearSet {
  setId: string;
  name: string;
  description: string;
  gearIds: string[];
}

export interface GearHistoryEntry {
  date: string;
  event: string;
  amount: number;
  staffId?: string;
}

export interface GearItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  unitCost: number;
  purchaseDate: string;
  expirationDate?: string;
  deliveryAllowed: boolean;
  facultyOnly: boolean;
  isHighRisk: boolean;
  isSet: boolean;
  setItems?: string[];
  condition: GearCondition;
  needsCleaning: boolean;
  maintenanceCount: number;
  gearHistory: GearHistoryEntry[];
  illustrationType: string;
}

export interface CartItem {
  cartId: string;
  itemId: string;
  itemName: string;
  isSet?: boolean;
  quantity: number;
  dateNeeded: string;
  returnDate: string;
  fulfillment: Fulfillment;
  deliveryLocation?: string;
}

export interface ReservationItem {
  itemId: string;
  itemName: string;
  isSet?: boolean;
  quantity: number;
  dateNeeded: string;
  returnDate: string;
  fulfillment: Fulfillment;
  deliveryLocation?: string;
}

export interface EditHistoryEntry {
  timestamp: string;
  staffId: string;
  staffName: string;
  action: string;
}

export interface Reservation {
  id: string;
  userId: string;
  staffId?: string;
  user: {
    userId: string;
    name: string;
    bNumber: string;
    email: string;
    userType: BereaRole;
  };
  items: ReservationItem[];
  status: ReservationStatus;
  notes: string;
  conditionNotes: string;
  submittedAt: string;
  checkoutDate?: string;
  checkinDate?: string;
  returnCondition?: GearCondition;
  needsCleaning?: boolean;
  editHistory: EditHistoryEntry[];
}

export interface PublicReservationLookup {
  id: string;
  status: ReservationStatus;
  submittedAt: string;
  pickupDate: string;
  returnDate: string;
  checkoutDate?: string;
  checkinDate?: string;
  fulfillment: Fulfillment;
  totalGearCount: number;
  itemSummaryText: string;
}

export interface CreateReservationPayload {
  user: {
    userId: string;
    name: string;
    bNumber: string;
    email: string;
    userType: BereaRole;
  };
  items: ReservationItem[];
  notes: string;
}
