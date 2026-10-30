import type {
  Category,
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

export const DEFAULT_CATEGORIES: Category[] = [
  { categoryId: 'CAT-CAMP',  name: 'Camping',  description: 'Tents, sleeping bags, stoves, and camp comfort gear' },
  { categoryId: 'CAT-WATER', name: 'Water',    description: 'Watercraft, paddles, and personal flotation devices' },
  { categoryId: 'CAT-HIKE',  name: 'Hiking',   description: 'Backpacks and trail support equipment' },
  { categoryId: 'CAT-CLIMB', name: 'Climbing', description: 'Technical climbing harnesses and protection gear' },
  { categoryId: 'CAT-WIN',   name: 'Winter',   description: 'Snowshoes and cold-weather expedition gear' },
  { categoryId: 'CAT-SET',   name: 'Sets',     description: 'Complete pre-bundled outdoor equipment sets' },
];

/**
 * Compute next sequential Reservation ID (e.g., R101) from existing reservations.
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
 * Compute next sequential Gear ID (e.g., G01) from existing gear items.
 */
export function getNextGearId(gearItems: GearItem[], isSet = false): string {
  const prefix = isSet ? 'SET-' : 'G';
  const maxNum = gearItems.reduce((max, g) => {
    const match = g.id.match(/^(?:G|SET-)(\d+)$/i);
    if (!match) return max;
    const num = parseInt(match[1], 10);
    return num > max ? num : max;
  }, 0);
  return `${prefix}${String(maxNum + 1).padStart(2, '0')}`;
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
 * Returns an empty array if the backend database API is not running or has no items yet.
 */
export async function fetchGearItems(): Promise<GearItem[]> {
  try {
    const res = await fetch(`${API_BASE}/items`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Create a new gear item or set in the database via Rentals/Inventory API.
 */
export async function createGearItemInDb(
  item: GearItem,
  staffId: string
): Promise<GearItem> {
  try {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, staffId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return item;
  }
}

/**
 * Update an existing gear item's logistics/details in the database.
 */
export async function updateGearItemInDb(
  item: GearItem,
  staffId: string
): Promise<GearItem> {
  try {
    const res = await fetch(`${API_BASE}/items/${encodeURIComponent(item.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, staffId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return item;
  }
}

/**
 * Delete a gear item from the database.
 */
export async function deleteGearItemFromDb(
  gearId: string,
  staffId: string
): Promise<{ gearId: string }> {
  try {
    const res = await fetch(`${API_BASE}/items/${encodeURIComponent(gearId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { gearId };
  }
}

/**
 * Fetch all reservations from the database via Rentals API.
 * Returns an empty array if the backend database API is not running or has no reservations yet.
 */
export async function fetchReservations(): Promise<Reservation[]> {
  try {
    const res = await fetch(`${API_BASE}/reservations`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [];
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
