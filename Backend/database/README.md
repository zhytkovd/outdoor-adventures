
# Outdoor Adventures — Database Schema

## 1. USER

- **Bnumber** (PK)
- Email (UNIQUE, NOT NULL)
- Name
- Role: `student | faculty | staff | oap`

**Notes:**
- OAP (Outdoor Adventure Program staff) has the highest permissions and is the only role that can manage reservations and gear.
- Faculty and staff are college employees who rent gear; they can reserve faculty-only gear and request delivery.
- Users can make multiple reservations.

## 2. CATEGORY

- **CategoryID** (PK)
- Code (UNIQUE), e.g. `CAT-CAMP`; the API returns it as `categoryId`
- Name
- Description

**Notes:**
- One category can contain multiple gear items.
- One category can contain multiple sets.
- The default categories (Camping, Water, Hiking, Climbing, Winter, Sets) are inserted by `schema.sql` and match the Frontend's `DEFAULT_CATEGORIES`.

## 3. GEAR

- **GearID** (PK)
- Name
- Description
- CategoryID (FK → CATEGORY)
- TotalQuantity
- UnitCost (decimal, cost of one unit)
- PurchaseDate
- ExpirationDate
- Condition: `good | minor_wear | damaged`
- NeedsCleaning (Boolean)
- MaintenanceCount (units held out of stock for cleaning/repair)
- DeliveryAllowed (Boolean)
- FacultyOnly (Boolean)
- IsHighRisk (Boolean)
- IsActive (Boolean)
- IllustrationType (catalog picture, e.g. `tent`, `kayak`; optional)

**Notes:**
- TotalQuantity represents the number of units owned.
- Available quantity = TotalQuantity − MaintenanceCount − units currently reserved.
- Condition and NeedsCleaning describe the item overall; MaintenanceCount says how many units are actually on hold, so one damaged tent doesn't block the others.
- Gear can belong to multiple sets.
- Gear history is tracked through EDIT_HISTORY.

## 4. GEAR_SET

- **SetID** (PK)
- Name
- Description
- CategoryID (FK → CATEGORY)
- IllustrationType (optional)

**Notes:**
- A set contains multiple gear items.
- A gear item can belong to multiple sets.
- Set contents are stored in SET_ITEM.

## 5. SET_ITEM

- **SetID** (FK → GEAR_SET)
- **GearID** (FK → GEAR)
- Quantity

**Primary Key:** (SetID, GearID)

**Notes:**
- Connects gear items to sets.
- Example: Camping Set = 1 tent + 2 sleeping bags.

## 6. RESERVATION

- **ReservationID** (PK)
- UserID (FK → USER.Bnumber)
- StaffID (FK → USER.Bnumber, NULLABLE)
- ReservationDate
- CheckoutDate
- CheckinDate
- PickupDelivery: `pickup | delivery`
- Status: `pending | approved | denied | checked_out | returned | cancelled`
- Notes

**Notes:**
- One user can make multiple reservations.
- One reservation can contain multiple gear items or sets.
- StaffID identifies who processed the reservation.
- Status changes are recorded in EDIT_HISTORY.

## 7. RESERVATION_ITEM

- **ReservationItemID** (PK)
- ReservationID (FK → RESERVATION)
- GearID (FK → GEAR, NULLABLE)
- SetID (FK → GEAR_SET, NULLABLE)
- Quantity

**Notes:**
- Connects reservations to gear or sets.
- Exactly one of GearID or SetID must be provided.
- Example: Reservation #1 contains 2 tents and 1 camping set.

## 8. EDIT_HISTORY

- **EditID** (PK)
- StaffID (FK → USER.Bnumber)
- EntityType: `user | gear | reservation`
- EntityID
- Action
- Amount (number of units involved, optional)
- EditDate
- Notes

**Notes:**
- Tracks changes made by OAP.
- Examples:
  - OAP approves reservation.
  - OAP changes gear condition.
  - OAP updates user role.
- EntityID identifies the changed record based on EntityType.

---

## 9. RELATIONSHIPS

| Entity | Relationship | Entity | Type |
|--------|-------------|--------|------|
| User | makes | Reservation | 1:N |
| User (Staff) | processes | Reservation | 1:N |
| Category | contains | Gear | 1:N |
| Category | contains | Gear_Set | 1:N |
| Gear_Set | contains | Gear | M:N (SET_ITEM) |
| Reservation | contains | Gear | M:N (RESERVATION_ITEM) |
| Reservation | contains | Gear_Set | M:N (RESERVATION_ITEM) |
| User (Staff) | creates | Edit_History | 1:N |

---

## 10. BUSINESS RULES

### Permissions
- Student: Create and view their own reservations.
- Faculty/Staff: Same as student, plus faculty-only gear and delivery.
- OAP: Full administrative access: approve/deny reservations, check gear in and out, manage gear, and manage users.

### Gear Availability
- Available quantity depends on total inventory and overlapping reservations.
- Approved and checked-out reservations reduce availability.
- Reservations for sets must account for all gear inside the set.
- Units on hold (MaintenanceCount) cannot be checked out.
- FacultyOnly gear can only be reserved by faculty, staff, or OAP.

### Reservations
- Reservations can contain multiple gear items or sets.
- Quantity must be greater than zero.
- CheckinDate must be after CheckoutDate.
- New reservations default to `pending`.
- Only OAP can approve or deny requests.

### Edit History
- OAP changes to users, gear, and reservations are logged.
- Each log records who made the change, what changed, and when.

---

## 11. API IDS

The Rentals API (`/api/rentals/items`) returns IDs in the Frontend's format:

| Table | Database | API |
|-------|----------|-----|
| gear | `gear_id = 1` | `G01` |
| gear_sets | `set_id = 1` | `SET-01` |
| categories | `code = 'CAT-CAMP'` | `CAT-CAMP` |

---

## 12. MIGRATIONS

`schema.sql` is the full, current schema for a new database. Changes to an existing database go in `migrations/`, numbered in order. Run each one once.

- `001_match_frontend_gear_fields.sql`: adds the gear fields the Frontend uses (cost, purchase date, cleaning/hold counts, faculty-only, illustration), changes the condition values, adds history amounts, and inserts the default categories.
