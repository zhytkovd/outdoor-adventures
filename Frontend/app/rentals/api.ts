import type {
  Category,
  GearSet,
  GearItem,
  GearCondition,
  Reservation,
  ReservationStatus,
  CreateReservationPayload,
  PublicReservationLookup,
  EditHistoryEntry,
} from './types';

const API_BASE = '/api/rentals';

/**
 * Date helper: returns YYYY-MM-DD offset by `days` from a given date (or today).
 */
export function addDays(baseDateStr: string, days: number): string {
  const base = baseDateStr ? new Date(`${baseDateStr}T00:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function nowTimestamp(): string {
  const now = new Date();
  return `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
}

export const CATEGORIES: Category[] = [
  { categoryId: 'CAT-CAMP',  name: 'Camping',  description: 'Tents, sleeping bags, stoves, and camp comfort gear' },
  { categoryId: 'CAT-WATER', name: 'Water',    description: 'Watercraft, paddles, and personal flotation devices' },
  { categoryId: 'CAT-HIKE',  name: 'Hiking',   description: 'Backpacks and trail support equipment' },
  { categoryId: 'CAT-CLIMB', name: 'Climbing', description: 'Technical climbing harnesses and protection gear' },
  { categoryId: 'CAT-WIN',   name: 'Winter',   description: 'Snowshoes and cold-weather expedition gear' },
  { categoryId: 'CAT-SET',   name: 'Sets',     description: 'Complete pre-bundled outdoor equipment sets' },
];

export const GEAR_SETS: GearSet[] = [
  {
    setId: 'SET-KAYAK',
    name: 'Kayak Complete Set',
    description: 'Includes 1 Kayak, 1 Paddle, and 1 Life Vest (PFD).',
    gearIds: ['g01', 'g10', 'g08'],
  },
  {
    setId: 'SET-CAMP',
    name: 'Backcountry Camping Set',
    description: 'Includes 1 Tent, 1 Sleeping Bag, 1 Backpack, and 1 Headlamp.',
    gearIds: ['g02', 'g04', 'g03', 'g05'],
  },
];

export const FALLBACK_GEAR_ITEMS: GearItem[] = [
  {
    id: 'g01',
    name: 'Kayak',
    description: 'Single touring kayak suitable for lakes and calm rivers.',
    categoryId: 'CAT-WATER',
    category: 'Water',
    totalQuantity: 8,
    availableQuantity: 6,
    deliveryAllowed: false,
    facultyOnly: false,
    isHighRisk: true,
    isSet: false,
    expirationDate: addDays(todayISO(), 540),
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'kayak',
  },
  {
    id: 'g02',
    name: 'Tent (3-Person)',
    description: '3-season weatherproof dome tent with rainfly and stakes.',
    categoryId: 'CAT-CAMP',
    category: 'Camping',
    totalQuantity: 12,
    availableQuantity: 7,
    deliveryAllowed: true,
    facultyOnly: false,
    isHighRisk: false,
    isSet: false,
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 1,
    illustrationType: 'tent',
  },
  {
    id: 'g03',
    name: 'Backpack (65L)',
    description: 'Internal-frame 65L expedition pack with adjustable torso.',
    categoryId: 'CAT-HIKE',
    category: 'Hiking',
    totalQuantity: 15,
    availableQuantity: 12,
    deliveryAllowed: true,
    facultyOnly: false,
    isHighRisk: false,
    isSet: false,
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'backpack',
  },
  {
    id: 'g04',
    name: 'Sleeping Bag (20°F)',
    description: '3-season mummy sleeping bag rated to 20°F with compression sack.',
    categoryId: 'CAT-CAMP',
    category: 'Camping',
    totalQuantity: 20,
    availableQuantity: 15,
    deliveryAllowed: true,
    facultyOnly: false,
    isHighRisk: false,
    isSet: false,
    condition: 'Good',
    needsCleaning: true,
    maintenanceCount: 1,
    illustrationType: 'sleeping-bag',
  },
  {
    id: 'g05',
    name: 'Headlamp',
    description: 'Rechargeable LED headlamp with red-light night mode.',
    categoryId: 'CAT-CAMP',
    category: 'Camping',
    totalQuantity: 25,
    availableQuantity: 20,
    deliveryAllowed: true,
    facultyOnly: false,
    isHighRisk: false,
    isSet: false,
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'headlamp',
  },
  {
    id: 'g06',
    name: 'Trekking Poles',
    description: 'Collapsible aluminum trekking poles with cork grips (pair).',
    categoryId: 'CAT-HIKE',
    category: 'Hiking',
    totalQuantity: 10,
    availableQuantity: 8,
    deliveryAllowed: false,
    facultyOnly: false,
    isHighRisk: false,
    isSet: false,
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'trekking-poles',
  },
  {
    id: 'g07',
    name: 'Expedition Cooler (65qt)',
    description: 'Heavy-duty rotomolded cooler for group field trips and events.',
    categoryId: 'CAT-CAMP',
    category: 'Camping',
    totalQuantity: 6,
    availableQuantity: 4,
    deliveryAllowed: true,
    facultyOnly: true,
    isHighRisk: false,
    isSet: false,
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'cooler',
  },
  {
    id: 'g08',
    name: 'Life Vest (PFD)',
    description: 'USCG Type III personal flotation device with adjustable straps.',
    categoryId: 'CAT-WATER',
    category: 'Water',
    totalQuantity: 12,
    availableQuantity: 10,
    deliveryAllowed: false,
    facultyOnly: false,
    isHighRisk: true,
    isSet: false,
    expirationDate: addDays(todayISO(), 365),
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'life-vest',
  },
  {
    id: 'g09',
    name: 'Dual-Burner Camp Stove',
    description: 'Propane two-burner camp stove (fuel canister issued at Base Camp).',
    categoryId: 'CAT-CAMP',
    category: 'Camping',
    totalQuantity: 8,
    availableQuantity: 5,
    deliveryAllowed: true,
    facultyOnly: true,
    isHighRisk: true,
    isSet: false,
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'camp-stove',
  },
  {
    id: 'g10',
    name: 'Kayak Paddle',
    description: 'Lightweight fiberglass-shaft two-piece kayak paddle.',
    categoryId: 'CAT-WATER',
    category: 'Water',
    totalQuantity: 10,
    availableQuantity: 8,
    deliveryAllowed: false,
    facultyOnly: false,
    isHighRisk: false,
    isSet: false,
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'paddle',
  },
  {
    id: 'g11',
    name: 'Climbing Harness',
    description: 'UIAA-certified climbing harness. Safety inspection logged per use.',
    categoryId: 'CAT-CLIMB',
    category: 'Climbing',
    totalQuantity: 8,
    availableQuantity: 6,
    deliveryAllowed: false,
    facultyOnly: false,
    isHighRisk: true,
    isSet: false,
    expirationDate: addDays(todayISO(), 180),
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'harness',
  },
  {
    id: 'g12',
    name: 'Snowshoes',
    description: 'All-terrain aluminum snowshoes with heel lifts.',
    categoryId: 'CAT-WIN',
    category: 'Winter',
    totalQuantity: 6,
    availableQuantity: 4,
    deliveryAllowed: false,
    facultyOnly: false,
    isHighRisk: false,
    isSet: false,
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'snowshoes',
  },
  {
    id: 'SET-KAYAK',
    name: 'Kayak Complete Set',
    description: 'Bundle: Kayak + Paddle + Life Vest (PFD).',
    categoryId: 'CAT-SET',
    category: 'Sets',
    totalQuantity: 6,
    availableQuantity: 5,
    deliveryAllowed: false,
    facultyOnly: false,
    isHighRisk: true,
    isSet: true,
    setItems: ['Kayak', 'Kayak Paddle', 'Life Vest (PFD)'],
    expirationDate: addDays(todayISO(), 365),
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'kayak',
  },
  {
    id: 'SET-CAMP',
    name: 'Backcountry Camping Set',
    description: 'Bundle: 3-Person Tent + Sleeping Bag + 65L Backpack + Headlamp.',
    categoryId: 'CAT-SET',
    category: 'Sets',
    totalQuantity: 8,
    availableQuantity: 6,
    deliveryAllowed: true,
    facultyOnly: false,
    isHighRisk: false,
    isSet: true,
    setItems: ['Tent (3-Person)', 'Sleeping Bag (20°F)', 'Backpack (65L)', 'Headlamp'],
    condition: 'Good',
    needsCleaning: false,
    maintenanceCount: 0,
    illustrationType: 'tent',
  },
];

export const FALLBACK_RESERVATIONS: Reservation[] = [
  // Pending
  {
    id: 'R101',
    userId: 'U-809214',
    user: { userId: 'U-809214', name: 'Charles Owusu', bNumber: 'B00809214', email: 'owusuc@berea.edu', userType: 'student' },
    items: [{ itemId: 'g01', itemName: 'Kayak', quantity: 1, dateNeeded: addDays(todayISO(), 2), returnDate: addDays(todayISO(), 16), fulfillment: 'Pickup' }],
    status: 'Pending',
    notes: 'Weekend paddle at Owsley Fork.',
    conditionNotes: '',
    submittedAt: addDays(todayISO(), -2),
    editHistory: [{ timestamp: `${addDays(todayISO(), -2)} 09:15`, staffId: 'SYSTEM', staffName: 'System', action: 'Reservation submitted (Pending)' }],
  },
  {
    id: 'R104',
    userId: 'U-123456',
    user: { userId: 'U-123456', name: 'Drew Asante', bNumber: 'B00123456', email: 'asanted@berea.edu', userType: 'faculty/staff' },
    items: [{ itemId: 'g07', itemName: 'Expedition Cooler (65qt)', quantity: 2, dateNeeded: addDays(todayISO(), 3), returnDate: addDays(todayISO(), 10), fulfillment: 'Delivery', deliveryLocation: 'Science Building 204' }],
    status: 'Pending',
    notes: 'Biology department field research trip.',
    conditionNotes: '',
    submittedAt: addDays(todayISO(), -1),
    editHistory: [{ timestamp: `${addDays(todayISO(), -1)} 11:30`, staffId: 'SYSTEM', staffName: 'System', action: 'Reservation submitted (Pending)' }],
  },
  {
    id: 'R105',
    userId: 'U-723418',
    user: { userId: 'U-723418', name: 'Alex Torres', bNumber: 'B00723418', email: 'torresa@berea.edu', userType: 'student' },
    items: [
      { itemId: 'g04', itemName: 'Sleeping Bag (20°F)', quantity: 3, dateNeeded: addDays(todayISO(), 4), returnDate: addDays(todayISO(), 18), fulfillment: 'Pickup' },
      { itemId: 'g05', itemName: 'Headlamp', quantity: 3, dateNeeded: addDays(todayISO(), 4), returnDate: addDays(todayISO(), 18), fulfillment: 'Pickup' },
    ],
    status: 'Pending',
    notes: 'Group trip to Pine Mountain.',
    conditionNotes: '',
    submittedAt: addDays(todayISO(), -1),
    editHistory: [{ timestamp: `${addDays(todayISO(), -1)} 14:20`, staffId: 'SYSTEM', staffName: 'System', action: 'Reservation submitted (Pending)' }],
  },
  {
    id: 'R106',
    userId: 'U-987612',
    user: { userId: 'U-987612', name: 'Jamie Lee', bNumber: 'B00987612', email: 'leej@berea.edu', userType: 'staff' },
    items: [{ itemId: 'g09', itemName: 'Dual-Burner Camp Stove', quantity: 1, dateNeeded: addDays(todayISO(), 5), returnDate: addDays(todayISO(), 12), fulfillment: 'Delivery', deliveryLocation: 'Woods-Penniman 102' }],
    status: 'Pending',
    notes: 'Staff retreat cookout.',
    conditionNotes: '',
    submittedAt: todayISO(),
    editHistory: [{ timestamp: `${todayISO()} 08:45`, staffId: 'SYSTEM', staffName: 'System', action: 'Reservation submitted (Pending)' }],
  },
  // Approved
  {
    id: 'R102',
    userId: 'U-109234',
    staffId: 'B00990011',
    user: { userId: 'U-109234', name: 'James Boateng', bNumber: 'B00109234', email: 'boatengj@berea.edu', userType: 'student' },
    items: [{ itemId: 'SET-CAMP', itemName: 'Backcountry Camping Set', isSet: true, quantity: 2, dateNeeded: addDays(todayISO(), 1), returnDate: addDays(todayISO(), 15), fulfillment: 'Pickup' }],
    status: 'Approved',
    notes: 'Red River Gorge weekend.',
    conditionNotes: '',
    submittedAt: addDays(todayISO(), -3),
    editHistory: [
      { timestamp: `${addDays(todayISO(), -3)} 10:00`, staffId: 'SYSTEM', staffName: 'System', action: 'Reservation submitted (Pending)' },
      { timestamp: `${addDays(todayISO(), -2)} 13:10`, staffId: 'B00990011', staffName: 'OAP Staff', action: 'Status changed to Approved' },
    ],
  },
  // Checked Out
  {
    id: 'R103',
    userId: 'U-506211',
    staffId: 'B00990011',
    user: { userId: 'U-506211', name: 'Morgan Appiah', bNumber: 'B00506211', email: 'appiahmj@berea.edu', userType: 'student' },
    items: [{ itemId: 'g03', itemName: 'Backpack (65L)', quantity: 1, dateNeeded: addDays(todayISO(), -4), returnDate: addDays(todayISO(), 10), fulfillment: 'Pickup' }],
    status: 'Checked Out',
    notes: '',
    conditionNotes: '',
    submittedAt: addDays(todayISO(), -6),
    checkoutDate: addDays(todayISO(), -4),
    editHistory: [
      { timestamp: `${addDays(todayISO(), -6)} 09:00`, staffId: 'SYSTEM', staffName: 'System', action: 'Reservation submitted (Pending)' },
      { timestamp: `${addDays(todayISO(), -5)} 11:00`, staffId: 'B00990011', staffName: 'OAP Staff', action: 'Status changed to Approved' },
      { timestamp: `${addDays(todayISO(), -4)} 15:30`, staffId: 'B00990011', staffName: 'OAP Staff', action: 'Checked Out at Base Camp' },
    ],
  },
  // Returned
  {
    id: 'R114',
    userId: 'U-345678',
    staffId: 'B00990011',
    user: { userId: 'U-345678', name: 'Quinn Ofori', bNumber: 'B00345678', email: 'oforiq@berea.edu', userType: 'student' },
    items: [{ itemId: 'g04', itemName: 'Sleeping Bag (20°F)', quantity: 1, dateNeeded: addDays(todayISO(), -14), returnDate: addDays(todayISO(), -2), fulfillment: 'Pickup' }],
    status: 'Returned',
    notes: '',
    conditionNotes: 'Good. Flagged for routine liner cleaning.',
    returnCondition: 'Good',
    needsCleaning: true,
    submittedAt: addDays(todayISO(), -16),
    checkoutDate: addDays(todayISO(), -14),
    checkinDate: addDays(todayISO(), -2),
    editHistory: [
      { timestamp: `${addDays(todayISO(), -16)} 12:00`, staffId: 'SYSTEM', staffName: 'System', action: 'Reservation submitted (Pending)' },
      { timestamp: `${addDays(todayISO(), -14)} 10:00`, staffId: 'B00990011', staffName: 'OAP Staff', action: 'Checked Out at Base Camp' },
      { timestamp: `${addDays(todayISO(), -2)} 16:05`, staffId: 'B00990011', staffName: 'OAP Staff', action: 'Checked In (Good · Needs Cleaning)' },
    ],
  },
  {
    id: 'R115',
    userId: 'U-812345',
    staffId: 'B00990011',
    user: { userId: 'U-812345', name: 'Evan Darko', bNumber: 'B00812345', email: 'darkoe@berea.edu', userType: 'student' },
    items: [{ itemId: 'g02', itemName: 'Tent (3-Person)', quantity: 1, dateNeeded: addDays(todayISO(), -12), returnDate: addDays(todayISO(), -1), fulfillment: 'Pickup' }],
    status: 'Returned',
    notes: '',
    conditionNotes: 'Damaged. Bent rainfly pole section — held for repair.',
    returnCondition: 'Damaged',
    needsCleaning: false,
    submittedAt: addDays(todayISO(), -15),
    checkoutDate: addDays(todayISO(), -12),
    checkinDate: addDays(todayISO(), -1),
    editHistory: [
      { timestamp: `${addDays(todayISO(), -15)} 14:00`, staffId: 'SYSTEM', staffName: 'System', action: 'Reservation submitted (Pending)' },
      { timestamp: `${addDays(todayISO(), -12)} 09:30`, staffId: 'B00990011', staffName: 'OAP Staff', action: 'Checked Out at Base Camp' },
      { timestamp: `${addDays(todayISO(), -1)} 14:40`, staffId: 'B00990011', staffName: 'OAP Staff', action: 'Checked In (Damaged — 1 unit held for repair)' },
    ],
  },
];

/**
 * Compute next sequential Reservation ID (e.g., R116) from existing reservations.
 */
export function getNextReservationId(reservations: Reservation[]): string {
  const maxNum = reservations.reduce((max, r) => {
    const match = r.id.match(/^R(\d+)$/i);
    if (!match) return max;
    const num = parseInt(match[1], 10);
    return num > max ? num : max;
  }, 100);
  return `R${maxNum + 1}`;
}

/**
 * Privacy-safe lookup by Reservation # (strips all personal info: no Name, B#, Email, or Room #).
 */
export function lookupReservationPublic(
  queryId: string,
  reservations: Reservation[]
): PublicReservationLookup | null {
  const cleanId = queryId.trim().toUpperCase();
  if (!cleanId) return null;
  const found = reservations.find(r => r.id.toUpperCase() === cleanId);
  if (!found) return null;

  const totalGearCount = found.items.reduce((sum, i) => sum + i.quantity, 0);
  const pickupDate = found.items.map(i => i.dateNeeded).sort()[0] ?? '—';
  const returnDate = found.items.map(i => i.returnDate).sort().reverse()[0] ?? '—';
  const hasDelivery = found.items.some(i => i.fulfillment === 'Delivery');

  return {
    id: found.id,
    status: found.status,
    submittedAt: found.submittedAt,
    pickupDate,
    returnDate,
    checkoutDate: found.checkoutDate,
    checkinDate: found.checkinDate,
    fulfillment: hasDelivery ? 'Delivery' : 'Pickup',
    totalGearCount,
    itemSummaryText: `${totalGearCount} gear unit${totalGearCount !== 1 ? 's' : ''} (${found.items.length} line item${found.items.length !== 1 ? 's' : ''})`,
  };
}

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
  const submittedAt = todayISO();
  const initialHistory: EditHistoryEntry = {
    timestamp: nowTimestamp(),
    staffId: payload.user.bNumber,
    staffName: payload.user.name,
    action: 'Reservation submitted (Pending)',
  };

  try {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, submittedAt, editHistory: [initialHistory] }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      id: fallbackId,
      userId: payload.user.userId,
      user: payload.user,
      items: payload.items,
      status: 'Pending',
      notes: payload.notes,
      conditionNotes: '',
      submittedAt,
      editHistory: [initialHistory],
    };
  }
}

/**
 * Update a reservation's status (Approve, Deny, Check Out) in the database.
 */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  staffId: string,
  staffName: string
): Promise<{
  id: string;
  status: ReservationStatus;
  staffId: string;
  checkoutDate?: string;
  historyEntry: EditHistoryEntry;
}> {
  const checkoutDate = status === 'Checked Out' ? todayISO() : undefined;
  const historyEntry: EditHistoryEntry = {
    timestamp: nowTimestamp(),
    staffId,
    staffName,
    action: status === 'Checked Out' ? 'Checked Out gear' : `Ticket status set to ${status}`,
  };

  try {
    const res = await fetch(`${API_BASE}/reservations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, staffId, checkoutDate, historyEntry }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { id, status, staffId, checkoutDate, historyEntry };
  }
}

/**
 * Record item check-in / return with condition, cleaning flag, and notes in the database.
 */
export async function checkInReservation(
  id: string,
  condition: GearCondition,
  needsCleaning: boolean,
  notes: string,
  staffId: string,
  staffName: string
): Promise<{
  id: string;
  status: ReservationStatus;
  returnCondition: GearCondition;
  needsCleaning: boolean;
  conditionNotes: string;
  checkinDate: string;
  staffId: string;
  historyEntry: EditHistoryEntry;
}> {
  const checkinDate = todayISO();
  const flags = [condition, needsCleaning ? 'Needs Cleaning' : null].filter(Boolean).join(' · ');
  const conditionNotes = `${flags}${notes ? ' — ' + notes : ''}`;
  const historyEntry: EditHistoryEntry = {
    timestamp: nowTimestamp(),
    staffId,
    staffName,
    action: `Checked In (${flags})`,
  };

  try {
    const res = await fetch(`${API_BASE}/reservations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Returned',
        returnCondition: condition,
        needsCleaning,
        conditionNotes,
        checkinDate,
        staffId,
        historyEntry,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      id,
      status: 'Returned',
      returnCondition: condition,
      needsCleaning,
      conditionNotes,
      checkinDate,
      staffId,
      historyEntry,
    };
  }
}

/**
 * Update staff/condition notes on a reservation in the database.
 */
export async function updateReservationNotes(
  id: string,
  notes: string,
  conditionNotes: string,
  staffId: string,
  staffName: string
): Promise<{
  id: string;
  notes: string;
  conditionNotes: string;
  historyEntry: EditHistoryEntry;
}> {
  const historyEntry: EditHistoryEntry = {
    timestamp: nowTimestamp(),
    staffId,
    staffName,
    action: 'Updated reservation / condition notes',
  };

  try {
    const res = await fetch(`${API_BASE}/reservations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, conditionNotes, staffId, historyEntry }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { id, notes, conditionNotes, historyEntry };
  }
}

/**
 * Mark a flagged gear item as cleaned / repaired in the database so held units return to available stock.
 */
export async function markGearReadyInDb(
  gearId: string,
  staffId: string
): Promise<{ gearId: string }> {
  try {
    const res = await fetch(`${API_BASE}/items/${encodeURIComponent(gearId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition: 'Good', needsCleaning: false, maintenanceCount: 0, staffId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { gearId };
  }
}
