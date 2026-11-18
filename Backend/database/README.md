
# Outdoor Adventures — Database Schema

## 1. USER

- **Bnumber** (PK)
- Email (UNIQUE, NOT NULL)
- Name
- Role: `student | faculty | staff | oap`

**Notes:**
- OAP has the highest permissions.
- Staff and OAP can manage reservations and gear.
- Users can make multiple reservations.

## 2. CATEGORY

- **CategoryID** (PK)
- Name
- Description

**Notes:**
- One category can contain multiple gear items.
- One category can contain multiple sets.

## 3. GEAR

- **GearID** (PK)
- Name
- Description
- CategoryID (FK → CATEGORY)
- TotalQuantity
- ExpirationDate
- Condition: `ready | needs_cleaning | needs_repair`
- DeliveryAllowed (Boolean)
- IsHighRisk (Boolean)
- IsActive (Boolean)

**Notes:**
- TotalQuantity represents the number of units owned.
- Available quantity is calculated based on reservations.
- Gear can belong to multiple sets.
- Gear history is tracked through EDIT_HISTORY.

## 4. GEAR_SET

- **SetID** (PK)
- Name
- Description
- CategoryID (FK → CATEGORY)

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
- EditDate
- Notes

**Notes:**
- Tracks changes made by staff or OAP.
- Examples:
  - Staff approves reservation.
  - Staff changes gear condition.
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
- Student/Faculty: Create and view their own reservations.
- Staff: Manage gear and process reservations.
- OAP: Full administrative access, including user management.

### Gear Availability
- Available quantity depends on total inventory and overlapping reservations.
- Approved and checked-out reservations reduce availability.
- Reservations for sets must account for all gear inside the set.
- Gear needing cleaning or repair cannot be checked out.

### Reservations
- Reservations can contain multiple gear items or sets.
- Quantity must be greater than zero.
- CheckinDate must be after CheckoutDate.
- New reservations default to `pending`.
- Only authorized staff/OAP can approve or deny requests.

### Edit History
- Staff and OAP changes to users, gear, and reservations are logged.
- Each log records who made the change, what changed, and when.
