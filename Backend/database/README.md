# Outdoor Adventures — Database Schema

## 1. USER

- **Bnumber** (PK)
- Email (UNIQUE, NOT NULL)
- Name
- Role: `student | faculty | staff | oap`
- IsActive (Boolean): deactivated users can't reserve gear; their history is kept

**Notes:**
- USER is for people who **reserve gear**. They sign in on `/rentals` with their B#.
- OAP staff log in to the staff portal with a separate STAFF_ACCOUNT.
- OAP (Outdoor Adventure Program staff) has the highest permissions and is the only role that can manage reservations and gear.
- Faculty and staff are college employees who rent gear; they can reserve faculty-only gear and request delivery.
- Users can make multiple reservations.

## 1b. STAFF_ACCOUNT

- **StaffAccountID** (PK)
- Username (UNIQUE, lowercase)
- PasswordHash (scrypt; the password itself is never stored)
- IsActive (Boolean)
- CreatedAt
- CreatedBy (FK → STAFF_ACCOUNT.Username, NULL for accounts made with `npm run create-staff`)

**Notes:**
- One account per OAP staff member. Staff create accounts in the portal's Users tab; the system generates the password.
- RESERVATION.StaffID and EDIT_HISTORY.StaffID store the staff account's Username.

## 2. CATEGORY

- **CategoryID** (PK)
- Code (UNIQUE), e.g. `CAT-CAMP`; the Rentals API returns it as `categoryId`
- Name
- Description
- Icon (VARCHAR(50), NULLABLE)

**Notes:**
- One category can contain multiple gear items.
- One category can contain multiple subcategories.
- One category can contain multiple sets.
- The default categories (Camping, Water, Hiking, Climbing, Winter, Sets) are inserted by `schema.sql` and match the Frontend's `DEFAULT_CATEGORIES`.
- Icon stores an optional identifier used to display the category in the frontend.
- The frontend's `itemCount` is calculated from gear records rather than stored in CATEGORY.

## 2b. SUBCATEGORY

- **SubcategoryID** (PK)
- CategoryID (FK → CATEGORY.CategoryID)
- Name (NOT NULL)
- UNIQUE (CategoryID, Name)

**Notes:**
- Each subcategory belongs to exactly one category.
- A category can contain multiple subcategories.
- A subcategory can contain multiple gear items.
- The same subcategory name may exist under different categories, but cannot be duplicated within the same category.
- Examples:
  - Camping → Tents, Sleeping Bags, Stoves
  - Hiking → Backpacks, Trekking Poles
  - Water → Kayaks, Paddles
  - Climbing → Harnesses
  - Winter → Snowshoes
- The Gear API uses a LEFT JOIN to include gear without an assigned subcategory.

## 3. GEAR

- **GearID** (PK)
- Name
- Description
- CategoryID (FK → CATEGORY)
- SubcategoryID (FK → SUBCATEGORY, NULLABLE)
- Size (VARCHAR(50), NULLABLE)
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
- Each gear item belongs to one category.
- Each gear item may belong to a subcategory within that category.
- SubcategoryID is nullable to support existing gear that has not been categorized further.
- The backend must verify that a selected subcategory belongs to the gear item's category.
- Size describes the gear's size or capacity, e.g. `Medium`, `2-Person`, `Adult`.
- TotalQuantity represents the number of units owned.
- Available quantity = TotalQuantity − MaintenanceCount − units currently reserved or checked out.
- Condition and NeedsCleaning describe the item overall; MaintenanceCount says how many units are actually on hold, so one damaged tent doesn't block the others.
- Gear can belong to multiple sets.
- Gear history is tracked through EDIT_HISTORY.
- Inactive gear remains in the database for historical records.
- Gear availability status (`Available`, `Rented`, `Maintenance`, `Inactive`) is calculated rather than stored as a separate column.
- A separate StaffOnly restriction is not part of the currently implemented database fields.

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
- StaffID (FK → STAFF_ACCOUNT.Username, NULLABLE)
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
- StaffID (FK → STAFF_ACCOUNT.Username)
- EntityType: `user | gear | reservation | staff_account`
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
|---|---|---|---|
| User | makes | Reservation | 1:N |
| Staff_Account | processes | Reservation | 1:N |
| Category | contains | Subcategory | 1:N |
| Category | contains | Gear | 1:N |
| Category | contains | Gear_Set | 1:N |
| Subcategory | classifies | Gear | 1:N |
| Gear_Set | contains | Gear | M:N (SET_ITEM) |
| Reservation | contains | Gear | M:N (RESERVATION_ITEM) |
| Reservation | contains | Gear_Set | M:N (RESERVATION_ITEM) |
| Staff_Account | creates | Edit_History | 1:N |
| Staff_Account | creates | Staff_Account | 1:N |

**Additional constraint:** Gear's CategoryID and SubcategoryID must refer to matching categories. Because these are separate foreign keys, this relationship requires additional backend validation.

---

## 10. BUSINESS RULES

### Permissions
- Student: Create and view their own reservations.
- Faculty/Staff: Same as student, plus faculty-only gear and delivery.
- OAP (staff accounts): Full administrative access: approve/deny reservations, check gear in and out, manage gear, create staff accounts, and deactivate users.
- FacultyOnly restricts access to gear based on the renter's role.

### Gear Availability
- Available quantity depends on total inventory and overlapping reservations.
- Approved and checked-out reservations reduce availability.
- Reservations for sets must account for all gear inside the set.
- Units on hold (MaintenanceCount) cannot be checked out.
- FacultyOnly gear can only be reserved by faculty, staff, or OAP.
- Inactive gear cannot be reserved.
- Availability calculations must prevent negative available quantities.

### Categories and Subcategories
- Every gear item must belong to an existing category.
- Assigning a subcategory is optional.
- Each subcategory must belong to an existing category.
- Gear can only reference a subcategory belonging to its assigned category.
- Subcategory names must be unique within each category.
- Category item counts are calculated from gear records.
- Category icons are optional display metadata.

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

| Table | Database | Rentals API |
|---|---|---|
| gear | `gear_id = 1` | `G01` |
| gear_sets | `set_id = 1` | `SET-01` |
| categories | `code = 'CAT-CAMP'` | `CAT-CAMP` |

The staff Gear API (`/api/gear`) uses numeric gear IDs.

For example:

- `GET /api/gear` — List all gear.
- `GET /api/gear/9` — Retrieve gear with database ID 9.
- `PUT /api/gear/9` — Update gear with database ID 9.
- `DELETE /api/gear/9` — Deactivate gear with database ID 9.

The subcategories table uses numeric `subcategory_id` values.

---

## 12. MIGRATIONS

`Backend/database/schema.sql` is the complete schema for setting up a new database.

Changes to an existing database belong in `Backend/database/migrations/`, numbered in order. Each migration should be executed only once per database.

### Existing migrations

- `001_match_frontend_gear_fields.sql` — Adds gear fields used by the Rentals frontend, including costs, purchase dates, cleaning and maintenance counts, faculty-only access, and illustration fields. Also updates condition values, adds history amounts, and inserts default categories.
- `002_staff_accounts.sql` — Adds STAFF_ACCOUNT authentication, USER.IsActive, and staff-account relationships for reservations and edit history.
- `003_...` — Existing project migration; refer to its SQL file for the exact changes.

### New migration

**`004_add_gear_subcategories.sql`**

Changes:

1. Adds `icon VARCHAR(50)` to CATEGORY.
2. Creates the SUBCATEGORY table.
3. Adds `subcategory_id INT NULL` to GEAR.
4. Adds `size VARCHAR(50) NULL` to GEAR.
5. Adds a foreign key from GEAR.SubcategoryID to SUBCATEGORY.SubcategoryID.

### Applying migrations

- Use the project's migration runner to execute the new SQL file against the configured MySQL database.
- Check for existing columns and constraints before running the migration.
- Verify the changes using `DESCRIBE categories`, `DESCRIBE subcategories`, and `DESCRIBE gear`.
- Existing gear records retain their data. New nullable columns initially contain NULL.
- If the team uses one shared Aiven database, execute the migration only once against that database.
- Keep `schema.sql` updated to reflect the latest structure for new installations.

---

## 13. GEAR FRONTEND INTEGRATION

The staff Gear Inventory frontend uses the following database fields:

| Frontend Field | Database Source |
|---|---|
| `id` | `gear.gear_id` |
| `name` | `gear.name` |
| `category` | `categories.name` |
| `subcategory` | `subcategories.name` |
| `size` | `gear.size` |
| `purchaseDate` | `gear.purchase_date` |
| `condition` | `gear.condition_status` |
| `description` | `gear.description` |
| `access` | Derived from `gear.faculty_only` |
| `status` | Calculated from active status, maintenance, and reservations |

The backend joins CATEGORY and SUBCATEGORY to retrieve readable names.

SUBCATEGORY uses a LEFT JOIN so gear without a subcategory still appears in the inventory.

**Current implementation notes:**
- `GET /api/gear` and `GET /api/gear/[id]` retrieve gear from MySQL.
- The frontend uses `mapApiGear()` to convert API fields into the `Gear` interface.
- Search and filtering operate on the frontend's gear array.
- The existing simplified status calculation does not yet fully account for reservations.
- Gear creation, editing, and deletion require their database-backed endpoints to be completed and connected to the frontend.