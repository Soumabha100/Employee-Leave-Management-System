# Employee Leave Management System API

A comprehensive Node.js + Express + MongoDB RESTful API for employee attendance, leave applications, approvals, and balance management.

---

## 👥 Team Responsibilities & Ownership

| Team Member | Role | Assigned Files & Responsibilities |
| :--- | :--- | :--- |
| **Soumabha** *(Leader)* | Foundation, Auth & Profile | • Architecture, Config, Error Handling, Shared Utils<br>• `models/User.js`<br>• `middleware/auth.js`<br>• `controllers/authController.js`<br>• `controllers/profileController.js`<br>• `routes/authRoutes.js`, `routes/profileRoutes.js` |
| **Soumyajit** | Attendance Management | • `models/Attendance.js`<br>• `controllers/attendanceController.js`<br>• `routes/attendanceRoutes.js` (`/api/attendance/check-in`, `/api/attendance/check-out`, `/api/attendance`) |
| **Souvojit** | Leave Applications | • `models/Leave.js`<br>• `controllers/leaveController.js`<br>• `routes/leaveRoutes.js` (`POST /api/leaves`, `GET /api/leaves`) |
| **Sohan** | Leave Review & Balances | • `models/LeaveBalance.js`<br>• `controllers/leaveReviewController.js`<br>• `controllers/leaveBalanceController.js`<br>• `routes/leaveReviewRoutes.js` (`GET /all`, `PUT /:id/approve`, `PUT /:id/reject`)<br>• `routes/leaveBalanceRoutes.js` (`GET /api/leave-balance`) |

---

## 📁 Project Structure

```text
├── config/
│   ├── constants.js          # Frozen global constants (ROLES, LEAVE_TYPES, STATUS, etc.)
│   └── db.js                 # MongoDB connection handler
├── controllers/
│   ├── attendanceController.js
│   ├── authController.js
│   ├── leaveBalanceController.js
│   ├── leaveController.js
│   ├── leaveReviewController.js
│   └── profileController.js
├── docs/
│   ├── agents.md             # AI Agent rules & team boundaries
│   └── logs.md               # Development milestone & test verification logs
├── middleware/
│   ├── auth.js               # JWT authentication & role-based authorization
│   ├── errorHandler.js       # Central error handling middleware
│   └── notFound.js           # 404 handler for unmatched routes
├── models/
│   ├── Attendance.js
│   ├── Leave.js
│   ├── LeaveBalance.js
│   └── User.js
├── Requirement/
│   └── GT 3.pdf              # Group Task 3 requirements document
├── routes/
│   ├── attendanceRoutes.js
│   ├── authRoutes.js
│   ├── leaveBalanceRoutes.js
│   ├── leaveReviewRoutes.js
│   ├── leaveRoutes.js
│   └── profileRoutes.js
├── utils/
│   ├── AppError.js           # Operational error class
│   ├── asyncHandler.js       # Async wrapper for Express routes
│   ├── dates.js              # Timezone-aware date parsing (Asia/Kolkata)
│   ├── pagination.js         # Query pagination and sort validation
│   └── validators.js         # ObjectId, string sanitization & regex helpers
├── .env.example
├── app.js                    # Express app initialization & route mounting
├── package.json
└── server.js                 # HTTP server bootstrap & graceful startup
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas URI)

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `.env` with your settings:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/leave_management
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### 4. Running the Server
```bash
# Development mode with auto-reload:
npm run dev

# Production start:
npm start
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Access | Owner | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Soumabha | Register new employee |
| `POST` | `/api/auth/login` | Public | Soumabha | Authenticate user & get JWT |
| `GET` | `/api/profile` | Private | Soumabha | Get authenticated user profile |
| `POST` | `/api/attendance/check-in` | Private | Soumyajit | Employee daily check-in |
| `PUT` | `/api/attendance/check-out` | Private | Soumyajit | Employee daily check-out |
| `GET` | `/api/attendance` | Private | Soumyajit | Attendance records (with pagination/date filters) |
| `POST` | `/api/leaves` | Private | Souvojit | Apply for leave |
| `GET` | `/api/leaves` | Private | Souvojit | View personal leave history |
| `GET` | `/api/leaves/all` | Admin / HR | Souvojit | View all leave requests (search, filter, sort, paginate) |
| `GET` | `/api/leaves/:id` | Private | Souvojit | View single leave (ownership check) |
| `DELETE` | `/api/leaves/:id` | Private | Souvojit | Cancel own pending leave |
| `PUT` | `/api/leaves/:id/approve` | Admin / HR | Sohan | Approve leave & deduct balance |
| `PUT` | `/api/leaves/:id/reject` | Admin / HR | Sohan | Reject leave request |
| `GET` | `/api/leave-balance` | Private | Sohan | Get current employee leave balance |

---

## 📮 Step-by-Step Postman Testing Guide (Authentication & Profile)

Ensure your server is running with `npm run dev` on `http://localhost:5001`.

### 1. Register a New Employee
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/auth/register`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "name": "Soumabha Majumder",
    "email": "soumabha@example.com",
    "password": "Password123!"
  }
  ```
- **Expected Status**: `201 Created`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": {
        "id": "6743...",
        "name": "Soumabha Majumder",
        "email": "soumabha@example.com",
        "role": "employee",
        "createdAt": "2026-11-24T..."
      }
    }
  }
  ```
- **Verification Checklist**:
  - [x] Status is `201 Created`.
  - [x] No `password` field exists in the response.
  - [x] In MongoDB Atlas, verify the document in `users` has its password stored as a bcrypt hash starting with `$2b$10$`.
  - [x] In MongoDB Atlas, verify a corresponding document exists in `leavebalances` for this user with `sick: 10, casual: 8, annual: 15`.

---

### 2. Duplicate Registration Rejection
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/auth/register`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (same email as Step 1):
  ```json
  {
    "name": "Duplicate Attempt",
    "email": "soumabha@example.com",
    "password": "DifferentPassword123!"
  }
  ```
- **Expected Status**: `409 Conflict`
- **Expected Response**:
  ```json
  {
    "success": false,
    "message": "Email already registered"
  }
  ```

---

### 3. Role Privilege Tampering Defense
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/auth/register`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "name": "Privilege Escalation Test",
    "email": "hacker@example.com",
    "password": "Password123!",
    "role": "admin"
  }
  ```
- **Expected Status**: `201 Created`
- **Verification Checklist**:
  - [x] `role` in the response is `"employee"`.
  - [x] In MongoDB, verify the stored `role` is `"employee"`, ignoring the client-supplied `"admin"`.

---

### 4. Input Validation & NoSQL Injection Rejection
Send each of the following requests to `POST http://localhost:5001/api/auth/register`:

| Test Scenario | Request Body | Expected Status | Expected Message |
| :--- | :--- | :---: | :--- |
| **Missing Name** | `{"email": "valid@email.com", "password": "password123"}` | `400` | `"name must be a string"` |
| **Short Password** | `{"name": "User", "email": "valid@email.com", "password": "123"}` | `400` | `"password must be at least 6 characters long"` |
| **Invalid Email** | `{"name": "User", "email": "notanemail", "password": "password123"}` | `400` | `"Invalid email format"` |
| **NoSQL Injection** | `{"name": "User", "email": {"$gt": ""}, "password": "password123"}` | `400` | `"email must be a string"` |

---

### 5. Login with Valid Credentials
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "email": "soumabha@example.com",
    "password": "Password123!"
  }
  ```
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "6743...",
        "name": "Soumabha Majumder",
        "email": "soumabha@example.com",
        "role": "employee",
        "createdAt": "2026-11-24T..."
      }
    }
  }
  ```
- **Action**: Copy the `token` string for use in subsequent tests.

---

### 6. Login Failure Scenarios
Send each of the following to `POST http://localhost:5001/api/auth/login`:

- **Wrong Password**:
  - Body: `{"email": "soumabha@example.com", "password": "wrongPassword123"}`
  - Status: `401 Unauthorized`
  - Message: `"Invalid email or password"`
- **Unknown Email**:
  - Body: `{"email": "nonexistent@example.com", "password": "Password123!"}`
  - Status: `401 Unauthorized`
  - Message: `"Invalid email or password"` (identical error message and timing mitigation)
- **NoSQL Injection Attempt**:
  - Body: `{"email": {"$gt": ""}, "password": "Password123!"}`
  - Status: `400 Bad Request`
  - Message: `"email must be a string"`

---

### 7. Access Protected Profile
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/profile`
- **Headers**:
  - `Authorization`: `Bearer <paste_your_token_from_step_5>`
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6743...",
        "name": "Soumabha Majumder",
        "email": "soumabha@example.com",
        "role": "employee",
        "createdAt": "2026-11-24T..."
      }
    }
  }
  ```
- **Verification Checklist**:
  - [x] Status is `200 OK`.
  - [x] Authenticated profile data returned without password or internal fields.

---

### 8. Access Protected Profile Without Token / Invalid Token
- **No Token**: Remove the `Authorization` header.
  - Status: `401 Unauthorized`
  - Message: `"Authentication required"`
- **Invalid Token**: Set `Authorization: Bearer invalid_or_tampered_token`.
  - Status: `401 Unauthorized`
  - Message: `"Invalid token"`

---

## 🔒 Security Architecture Highlights

1. **Password Defense-in-Depth**:
   - `models/User.js` has `select: false` on the `password` field.
   - Passwords hashed using bcryptjs with 10 salt rounds prior to persistence.
   - `toJSON` schema transform deletes `password` and `__v` as an automatic safety net.
2. **Timing-Attack Mitigation**:
   - Failed logins on unknown emails perform a constant-time dummy bcrypt comparison against a precomputed 60-character bcrypt hash, ensuring execution times do not leak user existence.
3. **NoSQL Injection Blocking**:
   - All string inputs (name, email, password) pass through `requireString()`, rejecting MongoDB query operators such as `{"$gt": ""}` with a 400 Bad Request.
4. **Denial-of-Service Defense**:
   - JSON request bodies capped at `10kb` (`express.json({ limit: '10kb' })`).
5. **Role-Based Authorization & Token Integrity**:
   - `protect` middleware verifies JWT signatures and fetches the user from MongoDB to enforce the database role, preventing spoofed role claims in forged tokens.
6. **Centralized Error Sanitization**:
   - Non-operational stack traces and raw Mongo errors are never exposed to clients; clients only receive consistent standard error envelopes.

---

## 📋 Leave Endpoints – Detailed Documentation (Owner: Souvojit)

> **Design Decision**: `totalDays` is calculated as **inclusive calendar days** (weekends included). For example, Friday to Monday = 4 days. This keeps the logic simple and consistent.

### POST `/api/leaves` — Apply for Leave

| Field | Source | Description |
| :--- | :--- | :--- |
| `leaveType` | Body | `sick`, `casual`, or `annual` |
| `fromDate` | Body | Start date in `YYYY-MM-DD` format |
| `toDate` | Body | End date in `YYYY-MM-DD` format |
| `reason` | Body | Non-empty string, max 500 characters |
| `employee_id` | Server (`req.user.id`) | Client-sent value is **ignored** |
| `status` | Server (`pending`) | Client-sent value is **ignored** |
| `totalDays` | Server-calculated | Inclusive calendar days |

**Validation rules applied in order:**
1. `leaveType` must be `sick`, `casual`, or `annual` → 400
2. `fromDate` and `toDate` must be valid `YYYY-MM-DD` → 400
3. `toDate` must not be before `fromDate` → 400
4. `fromDate` must not be in the past → 400
5. `reason` is required, 1–500 chars → 400
6. **Overlap check**: if same employee has a pending/approved leave overlapping dates → **409**
7. **Balance check**: if `LeaveBalance[leaveType] < totalDays` → 400 "Insufficient leave balance"

**Success**: `201 Created`

**Sample request:**
```json
{
  "leaveType": "casual",
  "fromDate": "2026-12-01",
  "toDate": "2026-12-03",
  "reason": "Family function"
}
```

**Sample response (201):**
```json
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "leave": {
      "_id": "674...",
      "employee_id": "673...",
      "leaveType": "casual",
      "fromDate": "2026-12-01T00:00:00.000Z",
      "toDate": "2026-12-03T00:00:00.000Z",
      "reason": "Family function",
      "status": "pending",
      "totalDays": 3,
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "createdAt": "2026-11-24T...",
      "updatedAt": "2026-11-24T..."
    }
  }
}
```

---

### GET `/api/leaves` — Employee's Own Leave History

**Query Parameters:**

| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | integer | `1` | Page number (≥ 1) |
| `limit` | integer | `10` | Items per page (1–100) |
| `status` | string | — | Filter: `pending`, `approved`, or `rejected` |
| `leaveType` | string | — | Filter: `sick`, `casual`, or `annual` |
| `from` | `YYYY-MM-DD` | — | Start of date range (overlapping leaves returned) |
| `to` | `YYYY-MM-DD` | — | End of date range |
| `sortBy` | string | `createdAt` | One of: `createdAt`, `fromDate`, `toDate`, `status`, `leaveType` |
| `order` | string | `desc` | `asc` or `desc` |

**Success**: `200 OK` with `{ leaves, pagination }`.

Invalid query values → `400 Bad Request`.

**Sample response (200):**
```json
{
  "success": true,
  "data": {
    "leaves": [ { "...leave object..." } ],
    "pagination": {
      "total": 12,
      "totalPages": 2,
      "currentPage": 1,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

### GET `/api/leaves/all` — HR / Admin: All Leave Requests

**Access**: `admin` or `hr` only. Employees → `403`.

**Query Parameters:**

| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | integer | `1` | Page number (≥ 1) |
| `limit` | integer | `10` | Items per page (1–100) |
| `status` | string | — | Filter: `pending`, `approved`, or `rejected` |
| `leaveType` | string | — | Filter: `sick`, `casual`, or `annual` |
| `employeeId` | ObjectId | — | Filter by specific employee (validated 24-hex) |
| `from` | `YYYY-MM-DD` | — | Date range start |
| `to` | `YYYY-MM-DD` | — | Date range end |
| `sortBy` | string | `createdAt` | Allow-list: `createdAt`, `fromDate`, `toDate`, `status`, `leaveType` |
| `order` | string | `desc` | `asc` or `desc` |
| `q` | string | — | Case-insensitive search on employee name or leave reason |

**Search (`q`) implementation:** Regex-escapes the query, finds users whose `name` matches (capped at 100), then uses `$or` to match `employee_id ∈ matchingUserIds` OR `reason` matching the regex. Populates `employee_id` with `name`, `email`, `role` only (never password).

**Success**: `200 OK` with `{ leaves, pagination }`.

---

### GET `/api/leaves/:id` — View Single Leave

**Access**: Private. Ownership check: if the leave belongs to someone else and the user is not HR or admin → `403`. Missing leave → `404`. Invalid ObjectId → `400`.

**Sample response (200):**
```json
{
  "success": true,
  "data": {
    "leave": {
      "_id": "674...",
      "employee_id": { "_id": "673...", "name": "John Doe", "email": "john@example.com", "role": "employee" },
      "leaveType": "sick",
      "fromDate": "2026-12-10T00:00:00.000Z",
      "toDate": "2026-12-12T00:00:00.000Z",
      "reason": "Medical appointment",
      "status": "pending",
      "totalDays": 3,
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "createdAt": "2026-11-24T...",
      "updatedAt": "2026-11-24T..."
    }
  }
}
```

---

### DELETE `/api/leaves/:id` — Cancel Own Pending Leave

**Access**: Only the leave owner may cancel, and only while `status` is `pending`.

| Scenario | Status Code |
| :--- | :--- |
| Successfully cancelled | `200` |
| Not found | `404` |
| Another user's leave | `403` |
| Already approved or rejected | `409` |

**Sample response (200):**
```json
{
  "success": true,
  "message": "Leave request cancelled successfully",
  "data": null
}
```

---

## 📮 Step-by-Step Postman Testing Guide (Leave Endpoints)

Ensure your server is running on `http://localhost:5001`. Log in as an employee to get a JWT token, and as an HR/Admin user for the `/all` endpoint tests.

### 1. Apply for Leave (Success)
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/leaves`
- **Headers**: `Authorization: Bearer <employee_token>`, `Content-Type: application/json`
- **Body**:
  ```json
  { "leaveType": "casual", "fromDate": "2026-12-01", "toDate": "2026-12-03", "reason": "Family function" }
  ```
- **Expected Status**: `201 Created`
- **Verify**: `totalDays` is `3`, `status` is `"pending"`, `employee_id` matches the logged-in user. Check MongoDB for the new document.

### 2. Missing Reason (400)
- **Body**: `{ "leaveType": "sick", "fromDate": "2026-12-05", "toDate": "2026-12-06" }`
- **Expected Status**: `400 Bad Request`
- **Expected Message**: `"reason is required"`

### 3. toDate Before fromDate (400)
- **Body**: `{ "leaveType": "sick", "fromDate": "2026-12-10", "toDate": "2026-12-05", "reason": "Test" }`
- **Expected Status**: `400`
- **Expected Message**: `"toDate cannot be before fromDate"`

### 4. Invalid leaveType (400)
- **Body**: `{ "leaveType": "vacation", "fromDate": "2026-12-10", "toDate": "2026-12-12", "reason": "Test" }`
- **Expected Status**: `400`
- **Expected Message**: `"leaveType must be one of: sick, casual, annual"`

### 5. Overlapping Dates (409)
- Apply for the same dates as Test 1 again.
- **Expected Status**: `409 Conflict`
- **Expected Message**: `"You already have a pending or approved leave that overlaps these dates"`

### 6. Insufficient Balance (400)
- Apply for more days than available balance (e.g., `fromDate: "2026-12-10"`, `toDate: "2027-01-20"` with `leaveType: "casual"` for 42 days when balance is 8).
- **Expected Status**: `400`
- **Expected Message**: `"Insufficient leave balance"`

### 7. Fake employee_id Ignored
- **Body**: `{ "leaveType": "sick", "fromDate": "2026-12-15", "toDate": "2026-12-16", "reason": "Test", "employee_id": "000000000000000000000000", "status": "approved" }`
- **Expected Status**: `201` — the returned `employee_id` matches `req.user.id`, not the fake one; `status` is `"pending"`.

### 8. Own Leave History (GET /api/leaves)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/leaves?page=1&limit=5&sortBy=fromDate&order=asc`
- **Expected Status**: `200 OK`
- **Verify**: Only the logged-in employee's leaves appear; pagination metadata is present.

### 9. Employee Calling /all (403)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/leaves/all`
- **Headers**: `Authorization: Bearer <employee_token>`
- **Expected Status**: `403 Forbidden`
- **Expected Message**: `"You do not have permission to perform this action"`

### 10. HR Calling /all (200)
- **Headers**: `Authorization: Bearer <hr_token>`
- **URL**: `http://localhost:5001/api/leaves/all?page=1&limit=10`
- **Expected Status**: `200 OK`
- **Verify**: Returns all employees' leaves with `employee_id` populated as `{ _id, name, email, role }` (no password).

### 11. Search by Employee Name (Case-Insensitive)
- **URL**: `http://localhost:5001/api/leaves/all?q=souvojit` (lowercase)
- **Expected**: Returns leaves belonging to "Souvojit…"
- **URL**: `http://localhost:5001/api/leaves/all?q=SOUVOJIT` (uppercase)
- **Expected**: Same results (case-insensitive).

### 12. Search + Status + Pagination + Sort Combined
- **URL**: `http://localhost:5001/api/leaves/all?q=souvojit&status=pending&sortBy=fromDate&order=asc&page=1&limit=5`
- **Expected Status**: `200`
- **Verify**: Only pending leaves matching the name, sorted by `fromDate` ascending, paginated.

### 13. Invalid Query Value (400)
- **URL**: `http://localhost:5001/api/leaves/all?status=unknown`
- **Expected Status**: `400`

### 14. Another Employee's Leave by ID (403)
- Get a leave ID belonging to another employee.
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/leaves/<other_employees_leave_id>`
- **Headers**: `Authorization: Bearer <employee_token>`
- **Expected Status**: `403`

### 15. Cancel Own Pending Leave (200)
- **Method**: `DELETE`
- **URL**: `http://localhost:5001/api/leaves/<own_pending_leave_id>`
- **Expected Status**: `200`
- **Verify**: Document deleted from MongoDB.

### 16. Cancel an Approved Leave (409)
- **Method**: `DELETE`
- **URL**: `http://localhost:5001/api/leaves/<approved_leave_id>`
- **Expected Status**: `409 Conflict`
- **Expected Message**: `"Cannot cancel a leave request that is already approved"`

---

## ⏱️ Attendance Endpoints – Detailed Documentation (Owner: Soumyajit)

> **Known Limitation & Architectural Decision**:
> - A shift that crosses midnight is out of scope.
> - A check-out always applies strictly to today's record (matching calendar day in the office timezone `Asia/Kolkata`, UTC+5:30).
> - Duplicate check-in prevention is enforced both via database query check and a unique compound index on `(employee_id, date)` with duplicate key (11000) race-condition handling.

### POST `/api/attendance/check-in` — Daily Check-In

- **Access**: Private (Authenticated Employee / User)
- **Request Body**: None (any body passed is ignored).
- **Rules**:
  - `employee_id` is set strictly from `req.user.id`.
  - `date` is normalized to `00:00:00.000 UTC` for the current office day (`startOfDay(now)`).
  - `checkIn` is recorded as current server instant (`now`).
  - `status` is automatically calculated:
    - If `minutesSinceMidnight(now) > 570` (09:30 AM Asia/Kolkata), marked as `late`.
    - Otherwise, marked as `present`.
  - Duplicate check: returns `409 Conflict` (`"Already checked in today"`) if a record for the current date already exists or on concurrent write collisions (Mongo 11000).

**Success**: `201 Created`

**Sample Response (201):**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "attendance": {
      "_id": "674...",
      "employee_id": "673...",
      "date": "2026-11-28T00:00:00.000Z",
      "checkIn": "2026-11-28T09:15:30.123Z",
      "checkOut": null,
      "status": "present",
      "createdAt": "2026-11-28T09:15:30.124Z",
      "updatedAt": "2026-11-28T09:15:30.124Z"
    }
  }
}
```

---

### PUT `/api/attendance/check-out` — Daily Check-Out

- **Access**: Private (Authenticated Employee / User)
- **Request Body**: None.
- **Rules**:
  - Finds today's attendance record (`date: startOfDay(now)`) for `req.user.id`.
  - If no check-in record exists for today: returns `404 Not Found` (`"No check-in found for today"`).
  - If check-out was already performed (`checkOut != null`): returns `409 Conflict` (`"Already checked out today"`).
  - Confirms check-out time is not earlier than check-in time (otherwise `400 Bad Request`).
  - Sets `checkOut = now`.

**Success**: `200 OK`

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Check-out successful",
  "data": {
    "attendance": {
      "_id": "674...",
      "employee_id": "673...",
      "date": "2026-11-28T00:00:00.000Z",
      "checkIn": "2026-11-28T09:15:30.123Z",
      "checkOut": "2026-11-28T17:45:00.456Z",
      "status": "present",
      "createdAt": "2026-11-28T09:15:30.124Z",
      "updatedAt": "2026-11-28T17:45:00.457Z"
    }
  }
}
```

---

### GET `/api/attendance` — Personal Attendance History & Records

- **Access**: Private (Authenticated Employee / User). Employees only see their own records.
- **Optional Admin/HR feature**: Admin and HR users may pass `?employeeId=<ObjectId>` to inspect attendance for a specific employee. Regular employees passing this query parameter continue to see only their own attendance records.

**Query Parameters:**

| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | integer | `1` | Page number (≥ 1) |
| `limit` | integer | `10` | Items per page (1–100) |
| `from` | `YYYY-MM-DD` | — | Start date of query range |
| `to` | `YYYY-MM-DD` | — | End date of query range (must be on or after `from`) |
| `status` | string | — | Filter by status: `present`, `late`, or `absent` |
| `sortBy` | string | `date` | Allow-list: `date`, `checkIn`, `checkOut`, `status` |
| `order` | string | `desc` | Sort order: `asc` or `desc` |
| `employeeId` | ObjectId | — | Admin/HR only: filter specific employee records |

**Success**: `200 OK`

**Sample Response (200):**
```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "_id": "674...",
        "employee_id": "673...",
        "date": "2026-11-28T00:00:00.000Z",
        "checkIn": "2026-11-28T09:15:30.123Z",
        "checkOut": "2026-11-28T17:45:00.456Z",
        "status": "present",
        "createdAt": "2026-11-28T...",
        "updatedAt": "2026-11-28T..."
      }
    ],
    "pagination": {
      "total": 1,
      "totalPages": 1,
      "currentPage": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

---

## 📮 Step-by-Step Postman Testing Guide (Attendance Endpoints)

### 1. Check-in OK (201)
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/attendance/check-in`
- **Headers**: `Authorization: Bearer <employee_token>`
- **Expected Status**: `201 Created`
- **Verify**: `status` is `"present"` or `"late"` depending on office hour, `checkOut` is `null`.

### 2. Check-in Twice Today (409)
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/attendance/check-in`
- **Headers**: `Authorization: Bearer <employee_token>`
- **Expected Status**: `409 Conflict`
- **Expected Message**: `"Already checked in today"`

### 3. Check-out OK (200)
- **Method**: `PUT`
- **URL**: `http://localhost:5001/api/attendance/check-out`
- **Headers**: `Authorization: Bearer <employee_token>`
- **Expected Status**: `200 OK`
- **Verify**: `checkOut` timestamp is recorded and later than `checkIn`.

### 4. Check-out Twice Today (409)
- **Method**: `PUT`
- **URL**: `http://localhost:5001/api/attendance/check-out`
- **Headers**: `Authorization: Bearer <employee_token>`
- **Expected Status**: `409 Conflict`
- **Expected Message**: `"Already checked out today"`

### 5. Check-out Without Check-in (404)
- Run for a user who has not checked in today.
- **Method**: `PUT`
- **URL**: `http://localhost:5001/api/attendance/check-out`
- **Headers**: `Authorization: Bearer <new_user_token>`
- **Expected Status**: `404 Not Found`
- **Expected Message**: `"No check-in found for today"`

### 6. Missing Authentication Token (401)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/attendance`
- **Headers**: *(Remove Authorization header)*
- **Expected Status**: `401 Unauthorized`
- **Expected Message**: `"Authentication required"`

### 7. Attendance List with Pagination (200)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/attendance?page=1&limit=5`
- **Headers**: `Authorization: Bearer <employee_token>`
- **Expected Status**: `200 OK`
- **Verify**: Only the logged-in employee's records appear; pagination metadata populated.

### 8. Date Range Filter (200)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/attendance?from=2026-11-01&to=2026-11-30`
- **Expected Status**: `200 OK`
- **Verify**: Records within date range returned.

### 9. Status Filter (200)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/attendance?status=present`
- **Expected Status**: `200 OK`
- **Verify**: Only `present` status records returned.

### 10. Sort by checkIn Ascending (200)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/attendance?sortBy=checkIn&order=asc`
- **Expected Status**: `200 OK`

### 11. Limit Above 100 (400)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/attendance?limit=150`
- **Expected Status**: `400 Bad Request`
- **Expected Message**: `"Query parameter 'limit' must be between 1 and 100"`

### 12. Invalid Date (400)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/attendance?from=invalid-date`
- **Expected Status**: `400 Bad Request`

### 13. Invalid Status (400)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/attendance?status=holiday`
- **Expected Status**: `400 Bad Request`

### 14. Data Isolation (Another Employee's Records Never Appear)
- Log in as Employee A and check in.
- Log in as Employee B and call `GET /api/attendance` (even passing `?employeeId=<Employee_A_Id>`).
- **Expected Status**: `200 OK`
- **Verify**: Employee B receives only their own records (or empty array if not checked in), never Employee A's records.
