export type UserRole = 'user' | 'staff';
export type UserType = 'Student' | 'Staff' | 'Faculty';
export type ItemCategory = 'All' | 'Camping' | 'Water' | 'Hiking' | 'Climbing' | 'Winter';
export type ReservationStatus = 'Pending' | 'Approved' | 'Checked Out' | 'Returned' | 'Declined';
export type Fulfillment = 'Pickup' | 'Delivery';

export interface UserInfo {
  bNumber: string;
  email: string;
  fullName: string;
  userType: UserType;
}

export interface GearItem {
  id: string;
  name: string;
  category: Exclude<ItemCategory, 'All'>;
  totalQuantity: number;
  availableQuantity: number;
  deliveryAvailable: boolean;
  illustrationType: string;
}

export interface CartItem {
  cartId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  dateNeeded: string;
  fulfillment: Fulfillment;
  deliveryLocation?: string;
}

export interface ReservationItem {
  itemId: string;
  itemName: string;
  quantity: number;
  dateNeeded: string;
  fulfillment: Fulfillment;
  deliveryLocation?: string;
}

export interface Reservation {
  id: string;
  user: {
    name: string;
    bNumber: string;
    email: string;
    userType: string;
  };
  items: ReservationItem[];
  status: ReservationStatus;
  notes: string;
  conditionNotes: string;
  submittedAt: string;
}

export interface CreateReservationPayload {
  user: {
    name: string;
    bNumber: string;
    email: string;
    userType: UserType;
  };
  items: ReservationItem[];
  notes: string;
}
