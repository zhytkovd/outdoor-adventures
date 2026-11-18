# Outdoor Adventures — Frontend (Rentals UI & Backend API Contract)

## 1. Local Setup & Environment Config

```bash
cd Frontend
npm install
npm run dev
```

### API Proxy Configuration (`next.config.ts` & `.env.example`)
- [`Frontend/next.config.ts`](./next.config.ts) automatically proxies `/api/:path*` to `process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'`.
- By default, no `.env.local` is required if your Backend server runs on `http://localhost:3001`.
- To point to a different Backend port or URL, copy [`.env.example`](./.env.example) to `.env.local`:
  ```env
  NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
  ```

---

## 2. Sign-In & Role Enforcement (`OAP` / `staff` / `faculty/staff` / `student`)

[`SignInGate.tsx`](./app/rentals/SignInGate.tsx) performs two layers of validation:
1. **Client-side format check**: Requires a 9-character Berea `B#` (`/^B\d{8}$/i`, e.g. `B01234567`), a `@berea.edu` email address, full name, and role selection.
2. **Backend role verification (`POST /api/rentals/auth`)**:
   - Calls `verifyUserSignIn()` in [`api.ts`](./app/rentals/api.ts#L22-L64).
   - **How Staff / OAP access is enforced by the Backend**:
     - The backend looks up `bNumber` (and `email`) in the MySQL `User` table.
     - If a user attempts to sign in with `userType: "OAP"`, `"staff"`, or `"faculty/staff"` when their database record is `"student"` (or not on the OAP staff roster), the backend should return **`403 Forbidden`** with `{ "error": "Your B# is not authorized for OAP/Staff access." }`.
     - If valid, the backend returns **`200 OK`** with the authoritative `UserInfo` record from the database, which the frontend uses to unlock or hide `StaffDashboard` and `LogisticsDashboard`.
   - *(Note: While `Backend/app/api/rentals/` routes are still being built, a network/404 response falls back to a local POC session so UI development isn't blocked.)*

---

## 3. Rentals Backend API Contract (`/api/rentals/*`)

All endpoints below are called by [`Frontend/app/rentals/api.ts`](./app/rentals/api.ts) and map directly to Next.js App Router route handlers under `Backend/app/api/rentals/`.

### 3.1 `POST /api/rentals/auth`
Verify user identity and role against the `User` table (or create a `student` record if new).
- **Backend Route File**: `Backend/app/api/rentals/auth/route.js`
- **Request Body**:
  ```json
  {
    "bNumber": "B01234567",
    "email": "razotet@berea.edu",
    "fullName": "Tristan Razote",
    "userType": "OAP"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "userId": "U-01234567",
    "bNumber": "B01234567",
    "email": "razotet@berea.edu",
    "fullName": "Tristan Razote",
    "userType": "OAP"
  }
  ```
- **Error Response (`401` / `403`)**:
  ```json
  {
    "error": "Your B# is not authorized for OAP Staff access."
  }
  ```

---

### 3.2 `GET /api/rentals/items`
Fetch all equipment items and sets for the User Catalog and OAP Logistics table.
- **Backend Route File**: `Backend/app/api/rentals/items/route.js`
- **Response (`200 OK`) — `GearItem[]`**:
  ```json
  [
    {
      "id": "G01",
      "name": "Tent (3-Person)",
      "description": "3-season weatherproof dome tent with rainfly and stakes.",
      "categoryId": "CAT-CAMP",
      "category": "Camping",
      "totalQuantity": 12,
      "availableQuantity": 7,
      "unitCost": 149.99,
      "purchaseDate": "2026-01-15",
      "expirationDate": "2028-01-15",
      "deliveryAllowed": true,
      "facultyOnly": false,
      "isHighRisk": false,
      "isSet": false,
      "setItems": [],
      "condition": "Good",
      "needsCleaning": false,
      "maintenanceCount": 1,
      "gearHistory": [
        {
          "date": "2026-01-15 09:00",
          "event": "Purchased & added to inventory",
          "amount": 12,
          "staffId": "B01234567"
        }
      ],
      "illustrationType": "tent"
    }
  ]
  ```

---

### 3.3 `POST /api/rentals/items`
Create a new gear item or set from the OAP `Gear & Logistics` dashboard.
- **Backend Route File**: `Backend/app/api/rentals/items/route.js`
- **Request Body (`GearItem & { staffId: string }`)**:
  ```json
  {
    "id": "G02",
    "name": "Kayak",
    "description": "Single touring kayak suitable for lakes and calm rivers.",
    "categoryId": "CAT-WATER",
    "category": "Water",
    "totalQuantity": 8,
    "availableQuantity": 8,
    "unitCost": 450.00,
    "purchaseDate": "2026-02-10",
    "expirationDate": "2028-02-10",
    "deliveryAllowed": false,
    "facultyOnly": false,
    "isHighRisk": true,
    "isSet": false,
    "condition": "Good",
    "needsCleaning": false,
    "maintenanceCount": 0,
    "gearHistory": [
      {
        "date": "2026-11-02 10:30",
        "event": "Purchased & added to inventory ($450.00/unit, bought 2026-02-10)",
        "amount": 8,
        "staffId": "B01234567"
      }
    ],
    "illustrationType": "kayak",
    "staffId": "B01234567"
  }
  ```
- **Response (`201 Created` / `200 OK`)**: Returns the created `GearItem` object.

---

### 3.4 `PATCH /api/rentals/items/:id`
Update an item's logistics fields OR clear an item from the OAP Cleaning/Repair Hold Queue.
- **Backend Route File**: `Backend/app/api/rentals/items/[id]/route.js`
- **Request Body (Mark Cleaned / Ready)**:
  ```json
  {
    "condition": "Good",
    "needsCleaning": false,
    "maintenanceCount": 0,
    "staffId": "B01234567"
  }
  ```
  *(Or full `GearItem` fields when edited in the Item Logistics modal.)*
- **Response (`200 OK`)**: Returns the updated `GearItem` (or `{ "gearId": "G01" }`).

---

### 3.5 `DELETE /api/rentals/items/:id`
Delete a gear item or set from inventory.
- **Backend Route File**: `Backend/app/api/rentals/items/[id]/route.js`
- **Request Body**:
  ```json
  {
    "staffId": "B01234567"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "gearId": "G01"
  }
  ```

---

### 3.6 `GET /api/rentals/reservations`
Fetch all reservations (with nested requester info, items, and edit history).
- **Backend Route File**: `Backend/app/api/rentals/reservations/route.js`
- **Response (`200 OK`) — `Reservation[]`**:
  ```json
  [
    {
      "id": "R101",
      "userId": "U-00809214",
      "staffId": "B01234567",
      "user": {
        "userId": "U-00809214",
        "name": "Charles Owusu",
        "bNumber": "B00809214",
        "email": "owusuc@berea.edu",
        "userType": "student"
      },
      "items": [
        {
          "itemId": "G01",
          "itemName": "Tent (3-Person)",
          "isSet": false,
          "quantity": 1,
          "dateNeeded": "2026-11-04",
          "returnDate": "2026-11-18",
          "fulfillment": "Pickup"
        }
      ],
      "status": "Pending",
      "notes": "Weekend camping trip.",
      "conditionNotes": "",
      "submittedAt": "2026-11-02",
      "checkoutDate": null,
      "checkinDate": null,
      "returnCondition": null,
      "needsCleaning": false,
      "editHistory": [
        {
          "timestamp": "2026-11-02 09:15",
          "staffId": "B00809214",
          "staffName": "Charles Owusu",
          "action": "Reservation submitted (Pending)"
        }
      ]
    }
  ]
  ```

---

### 3.7 `POST /api/rentals/reservations`
Submit a new reservation from the User flow.
- **Backend Route File**: `Backend/app/api/rentals/reservations/route.js`
- **Request Body**:
  ```json
  {
    "user": {
      "userId": "U-00809214",
      "name": "Charles Owusu",
      "bNumber": "B00809214",
      "email": "owusuc@berea.edu",
      "userType": "student"
    },
    "items": [
      {
        "itemId": "G01",
        "itemName": "Tent (3-Person)",
        "isSet": false,
        "quantity": 1,
        "dateNeeded": "2026-11-04",
        "returnDate": "2026-11-18",
        "fulfillment": "Pickup",
        "deliveryLocation": null
      }
    ],
    "notes": "Weekend camping trip.",
    "submittedAt": "2026-11-02",
    "editHistory": [
      {
        "timestamp": "2026-11-02 09:15",
        "staffId": "B00809214",
        "staffName": "Charles Owusu",
        "action": "Reservation submitted (Pending)"
      }
    ]
  }
  ```
- **Response (`201 Created` / `200 OK`)**: Returns the created `Reservation` object (including its generated `id`, e.g. `"R101"`).

---

### 3.8 `PATCH /api/rentals/reservations/:id`
Used for 3 staff/user operations on an existing reservation:

1. **Status Change (`Approved`, `Denied`, `Checked Out`)**:
   - **Request Body**:
     ```json
     {
       "status": "Checked Out",
       "staffId": "B01234567",
       "checkoutDate": "2026-11-04",
       "historyEntry": {
         "timestamp": "2026-11-04 14:10",
         "staffId": "B01234567",
         "staffName": "Tristan Razote",
         "action": "Checked Out gear"
       }
     }
     ```
2. **Check-In / Return (`Returned` + Condition & Cleaning Flag)**:
   - **Request Body**:
     ```json
     {
       "status": "Returned",
       "returnCondition": "Good",
       "needsCleaning": true,
       "conditionNotes": "Good · Needs Cleaning — muddy rainfly",
       "checkinDate": "2026-11-15",
       "staffId": "B01234567",
       "historyEntry": {
         "timestamp": "2026-11-15 16:00",
         "staffId": "B01234567",
         "staffName": "Tristan Razote",
         "action": "Checked In (Good · Needs Cleaning)"
       }
     }
     ```
3. **Edit Notes (`notes` / `conditionNotes`)**:
   - **Request Body**:
     ```json
     {
       "notes": "Updated user notes",
       "conditionNotes": "Updated staff condition notes",
       "staffId": "B01234567",
       "historyEntry": {
         "timestamp": "2026-11-05 11:20",
         "staffId": "B01234567",
         "staffName": "Tristan Razote",
         "action": "Updated reservation / condition notes"
       }
     }
     ```
- **Response (`200 OK`)**: Returns the updated fields (matching the request body).
