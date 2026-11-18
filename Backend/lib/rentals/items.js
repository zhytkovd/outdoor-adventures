import pool from '../../db';

// Builds the GearItem[] list the Frontend catalog expects
// (see Frontend/app/rentals/types.ts and Frontend/README.md §3.2)
// from the `gear`, `gear_sets`, `set_items`, `reservations`,
// `reservation_items` and `edit_history` tables.
//
// IDs use the Frontend's format (getNextGearId in Frontend/app/rentals/api.ts):
// gear_id 1 -> "G01", set_id 1 -> "SET-01". Categories use their `code`
// (e.g. "CAT-CAMP"). Use parseItemId() to turn an item ID back into a row.

export function formatGearId(gearId) {
  return `G${String(gearId).padStart(2, '0')}`;
}

export function formatSetId(setId) {
  return `SET-${String(setId).padStart(2, '0')}`;
}

export function parseItemId(id) {
  const match = /^(G|SET-)(\d+)$/i.exec(String(id || '').trim());
  if (!match) return null;
  return {
    kind: match[1].toUpperCase() === 'G' ? 'gear' : 'set',
    dbId: Number(match[2]),
  };
}

// Fallback picture when illustration_type is empty: guessed from the name.
// Matches gear names to the catalog pictures in
// Frontend/components/rentals/illustrations.tsx.
const ILLUSTRATION_KEYWORDS = [
  ['kayak', 'kayak'],
  ['canoe', 'kayak'],
  ['tent', 'tent'],
  ['backpack', 'backpack'],
  ['pack', 'backpack'],
  ['sleeping bag', 'sleeping-bag'],
  ['headlamp', 'headlamp'],
  ['lantern', 'headlamp'],
  ['trekking pole', 'trekking-poles'],
  ['hiking pole', 'trekking-poles'],
  ['cooler', 'cooler'],
  ['life vest', 'life-vest'],
  ['life jacket', 'life-vest'],
  ['pfd', 'life-vest'],
  ['stove', 'camp-stove'],
  ['paddle', 'paddle'],
  ['harness', 'harness'],
  ['snowshoe', 'snowshoes'],
];

export function illustrationFor(name) {
  const lower = (name || '').toLowerCase();
  const match = ILLUSTRATION_KEYWORDS.find(([word]) => lower.includes(word));
  return match ? match[1] : 'tent';
}

// gear.condition_status <-> Frontend GearCondition.
const CONDITION_TO_API = {
  good: 'Good',
  minor_wear: 'Minor wear',
  damaged: 'Damaged',
};

export function conditionToApi(conditionStatus) {
  return CONDITION_TO_API[conditionStatus] || 'Good';
}

export function conditionToDb(condition) {
  const entry = Object.entries(CONDITION_TO_API).find(([, api]) => api === condition);
  return entry ? entry[0] : null;
}

function formatDate(value) {
  if (!value) return undefined;
  // DATE columns arrive as "YYYY-MM-DD" strings (see db.js).
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // YYYY-MM-DD
}

function formatDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; // YYYY-MM-DD HH:MM
}

// Units of each gear item that are out right now: everything currently
// checked out (even if overdue), plus approved reservations whose window
// includes today. Reserved sets count against each gear item inside them.
async function fetchUnitsInUse(db) {
  const [rows] = await db.query(`
    SELECT gear_id, SUM(units) AS units_in_use
    FROM (
      SELECT ri.gear_id AS gear_id, ri.quantity AS units
      FROM reservation_items ri
      JOIN reservations r ON r.reservation_id = ri.reservation_id
      WHERE ri.gear_id IS NOT NULL
        AND (
          r.status = 'checked_out'
          OR (r.status = 'approved' AND NOW() BETWEEN r.checkout_date AND r.checkin_date)
        )

      UNION ALL

      SELECT si.gear_id AS gear_id, ri.quantity * si.quantity AS units
      FROM reservation_items ri
      JOIN reservations r ON r.reservation_id = ri.reservation_id
      JOIN set_items si ON si.set_id = ri.set_id
      WHERE ri.set_id IS NOT NULL
        AND (
          r.status = 'checked_out'
          OR (r.status = 'approved' AND NOW() BETWEEN r.checkout_date AND r.checkin_date)
        )
    ) AS in_use
    GROUP BY gear_id
  `);

  const unitsInUse = new Map();
  for (const row of rows) unitsInUse.set(row.gear_id, Number(row.units_in_use));
  return unitsInUse;
}

async function fetchGearHistory(db) {
  const [rows] = await db.query(`
    SELECT entity_id, action, amount, notes, edit_date, staff_id
    FROM edit_history
    WHERE entity_type = 'gear'
    ORDER BY edit_date ASC
  `);

  const history = new Map();
  for (const row of rows) {
    const gearId = Number(row.entity_id);
    if (!history.has(gearId)) history.set(gearId, []);
    history.get(gearId).push({
      date: formatDateTime(row.edit_date),
      event: row.notes ? `${row.action}: ${row.notes}` : row.action,
      amount: row.amount ?? 0,
      staffId: row.staff_id,
    });
  }
  return history;
}

// `db` defaults to the shared pool; pass a single connection to run inside a
// transaction (e.g. in tests).
export async function getAllItems(db = pool) {
  const [[gearRows], [setRows], [setItemRows], unitsInUse, history] = await Promise.all([
    db.query(`
      SELECT g.gear_id, g.name, g.description, g.category_id,
             c.code AS category_code, c.name AS category_name,
             g.total_quantity, g.unit_cost, g.purchase_date, g.expiration_date,
             g.condition_status, g.needs_cleaning, g.maintenance_count,
             g.delivery_allowed, g.faculty_only, g.is_high_risk,
             g.illustration_type
      FROM gear g
      JOIN categories c ON c.category_id = g.category_id
      WHERE g.is_active = TRUE
      ORDER BY c.name, g.name
    `),
    db.query(`
      SELECT s.set_id, s.name, s.description, s.category_id,
             c.code AS category_code, c.name AS category_name, s.illustration_type
      FROM gear_sets s
      JOIN categories c ON c.category_id = s.category_id
      ORDER BY c.name, s.name
    `),
    db.query(`SELECT set_id, gear_id, quantity FROM set_items`),
    fetchUnitsInUse(db),
    fetchGearHistory(db),
  ]);

  const gearById = new Map();
  const items = [];

  for (const g of gearRows) {
    // Only the units on hold (maintenance_count) and the units reserved right
    // now are unavailable; condition_status is a label for the item overall.
    const available = Math.max(
      0,
      g.total_quantity - g.maintenance_count - (unitsInUse.get(g.gear_id) || 0)
    );

    const item = {
      id: formatGearId(g.gear_id),
      name: g.name,
      description: g.description || '',
      categoryId: g.category_code || String(g.category_id),
      category: g.category_name,
      totalQuantity: g.total_quantity,
      availableQuantity: available,
      unitCost: Number(g.unit_cost),
      purchaseDate: formatDate(g.purchase_date) || '',
      expirationDate: formatDate(g.expiration_date),
      deliveryAllowed: Boolean(g.delivery_allowed),
      facultyOnly: Boolean(g.faculty_only),
      isHighRisk: Boolean(g.is_high_risk),
      isSet: false,
      setItems: [],
      condition: conditionToApi(g.condition_status),
      needsCleaning: Boolean(g.needs_cleaning),
      maintenanceCount: g.maintenance_count,
      gearHistory: history.get(g.gear_id) || [],
      illustrationType: g.illustration_type || illustrationFor(g.name),
    };

    gearById.set(g.gear_id, item);
    items.push(item);
  }

  const contentsBySet = new Map();
  for (const row of setItemRows) {
    if (!contentsBySet.has(row.set_id)) contentsBySet.set(row.set_id, []);
    contentsBySet.get(row.set_id).push(row);
  }

  for (const s of setRows) {
    // Only count gear that is still active; a set missing any of its gear
    // can't be built, so it shows 0 available.
    const contents = contentsBySet.get(s.set_id) || [];
    const parts = contents.map(row => ({ row, gear: gearById.get(row.gear_id) }));
    const complete = parts.length > 0 && parts.every(p => p.gear);

    // How many full sets can be put together from the gear on hand.
    const setsFrom = field =>
      complete
        ? Math.min(...parts.map(p => Math.floor(p.gear[field] / p.row.quantity)))
        : 0;

    const gearInSet = parts.filter(p => p.gear).map(p => p.gear);
    const worstCondition = ['Damaged', 'Minor wear'].find(c =>
      gearInSet.some(g => g.condition === c)
    ) || 'Good';

    items.push({
      id: formatSetId(s.set_id),
      name: s.name,
      description: s.description || '',
      categoryId: s.category_code || String(s.category_id),
      category: s.category_name,
      totalQuantity: setsFrom('totalQuantity'),
      availableQuantity: setsFrom('availableQuantity'),
      // A set's cost is the cost of the gear inside it.
      unitCost: Math.round(
        parts.reduce((sum, p) => sum + (p.gear ? p.gear.unitCost * p.row.quantity : 0), 0) * 100
      ) / 100,
      purchaseDate: '',
      expirationDate: undefined,
      deliveryAllowed: complete && parts.every(p => p.gear.deliveryAllowed),
      facultyOnly: gearInSet.some(g => g.facultyOnly),
      isHighRisk: gearInSet.some(g => g.isHighRisk),
      isSet: true,
      // The Frontend shows these as text, e.g. "Set includes: 2× Sleeping Bag".
      setItems: parts.map(p => {
        const name = p.gear ? p.gear.name : `Unavailable gear #${p.row.gear_id}`;
        return p.row.quantity > 1 ? `${p.row.quantity}× ${name}` : name;
      }),
      condition: worstCondition,
      needsCleaning: gearInSet.some(g => g.needsCleaning),
      // Holds are tracked on the gear inside the set, not on the set itself.
      maintenanceCount: 0,
      gearHistory: [],
      illustrationType:
        s.illustration_type || illustrationFor(parts[0]?.gear?.name || s.name),
    });
  }

  return items;
}
