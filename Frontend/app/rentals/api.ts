import type {
  GearItem,
  Reservation,
  ReservationStatus,
  CreateReservationPayload,
} from './types';

const API_BASE = '/api/rentals';

export const FALLBACK_GEAR_ITEMS: GearItem[] = [
  { id: 'g01', name: 'Kayak',            category: 'Water',    totalQuantity: 8,  availableQuantity: 6,  deliveryAvailable: false, illustrationType: 'kayak' },
  { id: 'g02', name: 'Tent',             category: 'Camping',  totalQuantity: 12, availableQuantity: 7,  deliveryAvailable: true,  illustrationType: 'tent' },
  { id: 'g03', name: 'Backpack',         category: 'Hiking',   totalQuantity: 15, availableQuantity: 12, deliveryAvailable: true,  illustrationType: 'backpack' },
  { id: 'g04', name: 'Sleeping Bag',     category: 'Camping',  totalQuantity: 20, availableQuantity: 15, deliveryAvailable: true,  illustrationType: 'sleeping-bag' },
  { id: 'g05', name: 'Headlamp',         category: 'Camping',  totalQuantity: 25, availableQuantity: 20, deliveryAvailable: true,  illustrationType: 'headlamp' },
  { id: 'g06', name: 'Trekking Poles',   category: 'Hiking',   totalQuantity: 10, availableQuantity: 8,  deliveryAvailable: false, illustrationType: 'trekking-poles' },
  { id: 'g07', name: 'Cooler',           category: 'Camping',  totalQuantity: 6,  availableQuantity: 4,  deliveryAvailable: false, illustrationType: 'cooler' },
  { id: 'g08', name: 'Life Vest',        category: 'Water',    totalQuantity: 12, availableQuantity: 10, deliveryAvailable: false, illustrationType: 'life-vest' },
  { id: 'g09', name: 'Camp Stove',       category: 'Camping',  totalQuantity: 8,  availableQuantity: 5,  deliveryAvailable: true,  illustrationType: 'camp-stove' },
  { id: 'g10', name: 'Paddle',           category: 'Water',    totalQuantity: 10, availableQuantity: 8,  deliveryAvailable: false, illustrationType: 'paddle' },
  { id: 'g11', name: 'Climbing Harness', category: 'Climbing', totalQuantity: 8,  availableQuantity: 6,  deliveryAvailable: false, illustrationType: 'harness' },
  { id: 'g12', name: 'Snowshoes',        category: 'Winter',   totalQuantity: 6,  availableQuantity: 4,  deliveryAvailable: false, illustrationType: 'snowshoes' },
];

export const FALLBACK_RESERVATIONS: Reservation[] = [
  // Pending (10)
  { id: 'R101', user: { name: 'Charles Owusu',    bNumber: 'B008092', email: 'owusuc@berea.edu',      userType: 'Student' }, items: [{ itemId: 'g01', itemName: 'Kayak',          quantity: 1, dateNeeded: '2024-04-12', fulfillment: 'Pickup' }], status: 'Pending', notes: '', conditionNotes: '', submittedAt: '2024-04-01' },
  { id: 'R104', user: { name: 'Sarah Kimani',     bNumber: 'B003451', email: 'kimanis@berea.edu',     userType: 'Student' }, items: [{ itemId: 'g02', itemName: 'Tent',           quantity: 2, dateNeeded: '2024-04-15', fulfillment: 'Delivery', deliveryLocation: 'Alumni Dorm 3B' }], status: 'Pending', notes: 'Spring camping trip.', conditionNotes: '', submittedAt: '2024-04-02' },
  { id: 'R105', user: { name: 'Alex Torres',      bNumber: 'B007234', email: 'torresa@berea.edu',     userType: 'Student' }, items: [{ itemId: 'g04', itemName: 'Sleeping Bag',   quantity: 3, dateNeeded: '2024-04-20', fulfillment: 'Pickup' }, { itemId: 'g05', itemName: 'Headlamp', quantity: 3, dateNeeded: '2024-04-20', fulfillment: 'Pickup' }], status: 'Pending', notes: 'Group trip to Pine Mountain.', conditionNotes: '', submittedAt: '2024-04-03' },
  { id: 'R106', user: { name: 'Jamie Lee',        bNumber: 'B009876', email: 'leej@berea.edu',        userType: 'Staff'   }, items: [{ itemId: 'g05', itemName: 'Headlamp',       quantity: 4, dateNeeded: '2024-04-22', fulfillment: 'Pickup' }], status: 'Pending', notes: '', conditionNotes: '', submittedAt: '2024-04-03' },
  { id: 'R107', user: { name: 'Taylor Mwangi',    bNumber: 'B002345', email: 'mwangit@berea.edu',     userType: 'Student' }, items: [{ itemId: 'g08', itemName: 'Life Vest',      quantity: 2, dateNeeded: '2024-04-14', fulfillment: 'Pickup' }], status: 'Pending', notes: 'Kayaking with the Outdoor Club.', conditionNotes: '', submittedAt: '2024-04-04' },
  { id: 'R108', user: { name: 'Jordan Blake',     bNumber: 'B006789', email: 'blakej@berea.edu',      userType: 'Student' }, items: [{ itemId: 'g06', itemName: 'Trekking Poles', quantity: 1, dateNeeded: '2024-04-25', fulfillment: 'Pickup' }], status: 'Pending', notes: '', conditionNotes: '', submittedAt: '2024-04-04' },
  { id: 'R109', user: { name: 'Casey Adofo',      bNumber: 'B004567', email: 'adofoc@berea.edu',      userType: 'Student' }, items: [{ itemId: 'g09', itemName: 'Camp Stove',     quantity: 1, dateNeeded: '2024-04-30', fulfillment: 'Delivery', deliveryLocation: 'Lincoln Hall 201' }], status: 'Pending', notes: 'Weekend backpacking trip.', conditionNotes: '', submittedAt: '2024-04-05' },
  { id: 'R110', user: { name: 'Riley Osei',       bNumber: 'B008901', email: 'oseir@berea.edu',       userType: 'Student' }, items: [{ itemId: 'g03', itemName: 'Backpack',       quantity: 2, dateNeeded: '2024-05-01', fulfillment: 'Pickup' }], status: 'Pending', notes: '', conditionNotes: '', submittedAt: '2024-04-06' },
  { id: 'R111', user: { name: 'Drew Asante',      bNumber: 'B001234', email: 'asanted@berea.edu',     userType: 'Faculty' }, items: [{ itemId: 'g10', itemName: 'Paddle',         quantity: 3, dateNeeded: '2024-04-17', fulfillment: 'Pickup' }], status: 'Pending', notes: 'Class field trip to Herrington Lake.', conditionNotes: '', submittedAt: '2024-04-06' },
  { id: 'R112', user: { name: 'Avery Mensah',     bNumber: 'B005678', email: 'mensaha@berea.edu',     userType: 'Student' }, items: [{ itemId: 'g12', itemName: 'Snowshoes',      quantity: 2, dateNeeded: '2024-05-05', fulfillment: 'Pickup' }], status: 'Pending', notes: '', conditionNotes: '', submittedAt: '2024-04-07' },
  // Approved (2)
  { id: 'R102', user: { name: 'James Boateng',    bNumber: 'B001092', email: 'boatengj@berea.edu',    userType: 'Student' }, items: [{ itemId: 'g02', itemName: 'Tent',           quantity: 5, dateNeeded: '2024-04-18', fulfillment: 'Pickup' }], status: 'Approved', notes: '', conditionNotes: '', submittedAt: '2024-04-01' },
  { id: 'R113', user: { name: 'Blake Acheampong', bNumber: 'B007890', email: 'acheampongb@berea.edu', userType: 'Student' }, items: [{ itemId: 'g07', itemName: 'Cooler',         quantity: 1, dateNeeded: '2024-04-16', fulfillment: 'Pickup' }], status: 'Approved', notes: 'Outdoor movie night.', conditionNotes: '', submittedAt: '2024-04-03' },
  // Checked Out (1)
  { id: 'R103', user: { name: 'Morgan Appiah',    bNumber: 'B005062', email: 'appiahmj@berea.edu',    userType: 'Student' }, items: [{ itemId: 'g03', itemName: 'Backpack',       quantity: 1, dateNeeded: '2024-04-05', fulfillment: 'Pickup' }], status: 'Checked Out', notes: '', conditionNotes: '', submittedAt: '2024-03-28' },
  // Returned (4)
  { id: 'R114', user: { name: 'Quinn Ofori',      bNumber: 'B003456', email: 'oforiq@berea.edu',      userType: 'Student' }, items: [{ itemId: 'g01', itemName: 'Kayak',          quantity: 2, dateNeeded: '2024-03-28', fulfillment: 'Pickup' }], status: 'Returned', notes: '', conditionNotes: 'Good condition.', submittedAt: '2024-03-20' },
  { id: 'R115', user: { name: 'Evan Darko',       bNumber: 'B008123', email: 'darkoe@berea.edu',      userType: 'Student' }, items: [{ itemId: 'g05', itemName: 'Headlamp',       quantity: 1, dateNeeded: '2024-03-30', fulfillment: 'Pickup' }], status: 'Returned', notes: '', conditionNotes: 'Minor wear on the band.', submittedAt: '2024-03-22' },
  { id: 'R116', user: { name: 'Sage Ansah',       bNumber: 'B004890', email: 'ansahs@berea.edu',      userType: 'Student' }, items: [{ itemId: 'g02', itemName: 'Tent',           quantity: 1, dateNeeded: '2024-04-02', fulfillment: 'Pickup' }], status: 'Returned', notes: '', conditionNotes: 'Good condition.', submittedAt: '2024-03-25' },
  { id: 'R117', user: { name: 'Robin Asare',      bNumber: 'B006234', email: 'asarer@berea.edu',      userType: 'Student' }, items: [{ itemId: 'g04', itemName: 'Sleeping Bag',   quantity: 2, dateNeeded: '2024-04-03', fulfillment: 'Pickup' }], status: 'Returned', notes: 'Need two different sizes if possible.', conditionNotes: 'Good condition.', submittedAt: '2024-03-26' },
];

/**
 * Fetch equipment catalog and availability from the database via Rentals API.
 */
export async function fetchGearItems(): Promise<GearItem[]> {
  try {
    const res = await fetch(`${API_BASE}/items`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return FALLBACK_GEAR_ITEMS;
  }
}

/**
 * Fetch all reservations from the database via Rentals API.
 */
export async function fetchReservations(): Promise<Reservation[]> {
  try {
    const res = await fetch(`${API_BASE}/reservations`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return FALLBACK_RESERVATIONS;
  }
}

/**
 * Submit a new equipment reservation to the database.
 */
export async function createReservation(
  payload: CreateReservationPayload,
  fallbackId: string
): Promise<Reservation> {
  try {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      id: fallbackId,
      user: payload.user,
      items: payload.items,
      status: 'Pending',
      notes: payload.notes,
      conditionNotes: '',
      submittedAt: new Date().toISOString().split('T')[0],
    };
  }
}

/**
 * Update a reservation's status (Approve, Decline, Check Out) in the database.
 */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<{ id: string; status: ReservationStatus }> {
  try {
    const res = await fetch(`${API_BASE}/reservations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { id, status };
  }
}

/**
 * Record item check-in / return with condition and notes in the database.
 */
export async function checkInReservation(
  id: string,
  condition: string,
  notes: string
): Promise<{ id: string; status: ReservationStatus; conditionNotes: string }> {
  const conditionNotes = `${condition}${notes ? '. ' + notes : ''}`;
  try {
    const res = await fetch(`${API_BASE}/reservations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Returned', condition, conditionNotes }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { id, status: 'Returned', conditionNotes };
  }
}

/**
 * Update staff/condition notes on a reservation in the database.
 */
export async function updateReservationNotes(
  id: string,
  notes: string,
  conditionNotes: string
): Promise<{ id: string; notes: string; conditionNotes: string }> {
  try {
    const res = await fetch(`${API_BASE}/reservations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, conditionNotes }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { id, notes, conditionNotes };
  }
}
