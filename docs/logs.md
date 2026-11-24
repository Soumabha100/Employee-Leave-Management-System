# Development & Activity Logs

This log records all changes, milestones, test verifications, and architectural decisions across project phases.

---

## [Phase 1] - Project Foundation & Skeleton Setup
- **Date**: 2026-11-24
- **Owner**: Soumabha (Leader)
- **Branch**: `main`
- **Commit**: `13c9a79` & `995d05f`
- **Remote**: `https://github.com/Soumabha100/Employee-Leave-Management-System.git`

### Summary of Work:
1. Created Node.js CommonJS backend with strict dependency constraints (`express`, `mongoose`, `dotenv`, `bcryptjs`, `jsonwebtoken`, dev: `nodemon`).
2. Configured `.gitignore` to prevent leaks of `.env`, `node_modules`, `uploads/*`, `logs`, `.DS_Store`.
3. Created frozen constants in `config/constants.js` (`ROLES`, `LEAVE_TYPES`, `LEAVE_STATUS`, `ATTENDANCE_STATUS`, `DEFAULT_BALANCES`, `OFFICE_START`, `TZ_OFFSET_MINUTES = 330`).
4. Implemented central error handler `middleware/errorHandler.js` mapping `AppError`, Mongoose validation errors, Cast errors, duplicate key (11000), JWT errors, and JSON parser failures.
5. Implemented shared utilities with JSDoc:
   - `utils/AppError.js`: Standard operational error class with `(message, statusCode, errors?)`.
   - `utils/asyncHandler.js`: Express 4 & 5 compatible promise wrapper.
   - `utils/pagination.js`: `parsePagination`, `buildPaginationMeta`, `parseSort`.
   - `utils/validators.js`: `escapeRegex`, `isValidObjectId`, `validateObjectId`, `requireString`.
   - `utils/dates.js`: `parseDateParam`, `startOfDay`, `minutesSinceMidnight`, `daysBetweenInclusive` (Asia/Kolkata).
6. Initialized team route stubs and controller files with ownership headers for all 4 team members.
7. Verification suite: 19/19 unit tests passed; smoke test endpoints tested (`/api/health`, 404, bad JSON).
8. Pushed to remote `main`.

---

## [Phase 2] - Authentication, Authorization & User Models
- **Date**: 2026-11-24
- **Owner**: Soumabha (Leader)
- **Branch**: `feat/foundation-auth`
- **Status**: Completed & Verified

### Summary of Work:
1. **Model Implementation**:
   - `models/User.js`: Schema with `name` (2-50 chars), `email` (regex validated, unique, lowercase), `password` (min 6 chars, `select: false`), and `role` (`ROLES` enum, default `'employee'`). Includes pre-save bcrypt hook (10 rounds), `comparePassword` instance method, and `toJSON` transform to strip passwords and `__v`.
   - `models/LeaveBalance.js`: Schema with `employee_id` (ref `User`, unique), and `sick: 10`, `casual: 8`, `annual: 15` from `DEFAULT_BALANCES`.
2. **Utilities & Middleware**:
   - `utils/token.js`: `signToken(user)` (encodes `id` and `role` with configurable expiration) and `verifyToken(token)`.
   - `middleware/auth.js`: `protect` middleware verifying `Bearer <token>`, checking database user existence, and populating `req.user` with database role.
   - `middleware/role.js`: `authorize(...allowedRoles)` factory returning 401 if unauthenticated and 403 if role unauthorized.
3. **Controllers & Endpoints**:
   - `controllers/authController.js`:
     - `register` (POST `/api/auth/register`): Validates inputs via `requireString`, validates email regex, ignores client-supplied roles (always assigns `'employee'`), checks existing email (409), creates user and default `LeaveBalance` atomically (rolls back user if balance creation fails).
     - `login` (POST `/api/auth/login`): Validates inputs via `requireString`, queries user with password, mitigates timing attacks on non-existent accounts using dummy bcrypt comparison, verifies password, and returns JWT with safe user object.
   - `controllers/profileController.js`:
     - `getProfile` (GET `/api/profile`): Reads user from DB using `req.user.id` and returns clean profile without password or ID in route URL.
4. **Server Startup Wire-up**:
   - In `server.js`, registered index builds: `await User.init()` and `await LeaveBalance.init()` upon database connection.
5. **Team Governance Guidelines**:
   - Created `agents.md` outlining agent constraints, boundaries, forbidden actions, and ownership matrix.

### Verification Results (12 / 12 PASSED):
1. **Check 1 (Register OK)**: Returns status 201, no password in response, bcrypt hash in DB starting with `$2`, LeaveBalance initialized with `{ sick: 10, casual: 8, annual: 15 }`. [PASS]
2. **Check 2 (Register Duplicate Email)**: Returns status 409 with `"Email already registered"`. [PASS]
3. **Check 3 (Register Ignore Role)**: Client-supplied `role: "admin"` is ignored; user created strictly with `role: "employee"`. [PASS]
4. **Check 4 (Register Validation)**: Missing name, short password (<6 chars), invalid email format, and NoSQL object email `{ "$gt": "" }` all rejected with status 400. [PASS]
5. **Check 5 (Login OK)**: Returns status 200 with JWT token; decoded payload contains strictly `id`, `role`, `iat`, `exp`. [PASS]
6. **Check 6 (Login Constant Failure Message)**: Wrong password and unknown email both return status 401 with identical message `"Invalid email or password"`. [PASS]
7. **Check 7 (Login NoSQL Guard)**: `{ "email": { "$gt": "" }, "password": "x" }` rejected with status 400 (`"email must be a string"`). [PASS]
8. **Check 8 (GET /api/profile Auth)**: Missing header -> 401, `"Bearer garbage"` -> 401, wrong secret -> 401, expired token -> 401, valid token -> 200 with clean user profile. [PASS]
9. **Check 9 (Deleted User Handling)**: Reusing valid token after deleting user from database returns 401 `"User no longer exists"`. [PASS]
10. **Check 10 (Role Authorization)**: `authorize('admin', 'hr')` returns 403 `"You do not have permission to perform this action"` for employee tokens, while admin and hr tokens call `next()`. [PASS]
11. **Check 11 (Response Data Leak Audit)**: No plaintext password or bcrypt hashes present in any client responses. [PASS]
12. **Check 12 (NoSQL Query Audit)**: Verified that zero controller queries pass `req.body` or `req.query` directly into Mongoose operations. [PASS]

---

## [Phase 2 - Tasks 3 & 4] - Live Cluster Testing, Security Sweep & PR Review
- **Date**: 2026-11-24
- **Owner**: Soumabha (Leader)
- **Branch**: `feat/foundation-auth`
- **Status**: Completed

### Live MongoDB Cluster Verification:
- Connected to remote cluster `ac-riw56jg-shard-00-00.egzrx3f.mongodb.net`.
- Successfully validated full registration, duplicate registration, role escalation defense, validation constraints, login timing defense, and profile access against live MongoDB Atlas.
- Verified in live database that:
  - User password starts with `$2b$10$` (bcrypt hashed).
  - Default `LeaveBalance` document created with `{ sick: 10, casual: 8, annual: 15 }`.
  - Zero password leaks across all JSON response payloads.

### Repository Security Sweep Findings & Actions:
1. **Bearer Token Parsing Defense**: Refactored `middleware/auth.js` to use `substring(7).trim()` instead of simple split to defensively handle edge cases with variable whitespace.
2. **Timing Attack Hardening**: Verified constant-time dummy hash comparison is active on unknown user login attempts.
3. **NoSQL Injection Resistance**: Verified all string inputs in controllers enforce `requireString()`.
4. **Secrets Audit**: Confirmed `.env` is uncommitted and strictly tracked by `.gitignore`.
5. **Documentation**: Added comprehensive 8-step Postman testing guide to `README.md`.

---

## [Phase 3] - Leave Applications, History, Search & Filtering
- **Date**: 2026-11-24
- **Owner**: Souvojit Sadhukhan (Member 3)
- **Branch**: `feat/leaves`
- **Status**: Completed & Verified

### Summary of Work:
1. **Model Implementation (`models/Leave.js`)**:
   - Defined `leaveSchema` with:
     - `employee_id`: required ObjectId reference to `User`.
     - `leaveType`: enum (`sick`, `casual`, `annual`), required.
     - `fromDate` & `toDate`: required Date fields.
     - `reason`: required string, trimmed, capped at 500 characters.
     - `status`: enum (`pending`, `approved`, `rejected`), defaults to `'pending'`.
     - `totalDays`: required integer (minimum 1), computed server-side as inclusive calendar days.
     - `reviewedBy`: ObjectId reference to `User` (defaults to `null`).
     - `reviewedAt`: Date (defaults to `null`).
     - `rejectionReason`: trimmed string (defaults to `null`).
   - Created compound indexes:
     - `{ employee_id: 1, fromDate: 1 }` for personal history and overlap lookups.
     - `{ status: 1, createdAt: 1 }` for administrative dashboard filtering.
   - Configured `toJSON` transform to strip `__v`.

2. **Controllers (`controllers/leaveController.js`)**:
   - `applyLeave` (POST `/api/leaves`):
     - Sanitizes payload: selectively extracts only `leaveType`, `fromDate`, `toDate`, `reason`. Client-sent `employee_id`, `status`, and `totalDays` are completely ignored.
     - Input validation: validates enum membership, strict `YYYY-MM-DD` date parsing, verifies `toDate >= fromDate`, enforces `fromDate >= today` (Asia/Kolkata timezone), and enforces non-empty `reason` <= 500 characters.
     - Date math: calculates `totalDays` as inclusive calendar days via `daysBetweenInclusive`.
     - Overlap prevention (409 Conflict): rejects requests where an employee already has an active (`pending` or `approved`) leave spanning the requested date window (`existing.fromDate <= new.toDate && existing.toDate >= new.fromDate`).
     - Balance check (400 Bad Request): verifies `LeaveBalance[leaveType] >= totalDays` without early deduction (atomic deduction deferred to Sohan's approval endpoint).
     - Returns status `201 Created` with the newly created leave record.
   - `getMyLeaves` (GET `/api/leaves`):
     - Scoped strictly to `req.user.id`.
     - Supports pagination (`page`, `limit`), filters (`status`, `leaveType`, date range `from` and `to` matching overlapping leaves), and sorting against an allow-list (`createdAt`, `fromDate`, `toDate`, `status`, `leaveType`) with order `asc` or `desc`.
     - Validates all query parameters, returning 400 on malformed input.
   - `getAllLeaves` (GET `/api/leaves/all`):
     - Administrative endpoint protected by `authorize('admin', 'hr')`.
     - Provides complete query suite: pagination, filters by `status`, `leaveType`, `employeeId` (with `isValidObjectId` validation), and date bounds (`from`, `to`).
     - High-performance case-insensitive search (`q`): escapes regex special characters, queries `User` collection for matching names (capped at 100 IDs), then issues an `$or` query on `employee_id IN matchingUserIds` OR `reason =~ /q/i`.
     - Populates `employee_id` with only safe fields: `name`, `email`, `role` (strictly omitting `password`).
     - Reuses identical filter object across `countDocuments` and `find` to guarantee pagination accuracy.
   - `getLeaveById` (GET `/api/leaves/:id`):
     - Fetches individual leave request with populated user details.
     - Ownership guard: allows access only to the document owner, Admin, or HR; returns 403 Forbidden for unauthorized employees.
     - Validates MongoDB ObjectId format, returning 400 on invalid IDs and 404 if not found.
   - `cancelLeave` (DELETE `/api/leaves/:id`):
     - Ownership guard: only the creator (`employee_id === req.user.id`) may cancel; unauthorized users receive 403 Forbidden.
     - State machine guard: allows cancellation only while `status === 'pending'`. Approved or rejected leaves return 409 Conflict.
     - Deletes document upon validation and returns 200 OK.

3. **Routing Architecture & Route Ordering (`routes/leaveRoutes.js`)**:
   - Enforces `protect` authentication across all leave routes.
   - Critical Route Ordering: mounted `GET /all` strictly **before** `GET /:id` to prevent Express from treating the literal string `"all"` as an ObjectId parameter.
   - Attached `validateObjectId('id')` middleware to all parameterized routes (`/:id`).
   - Cleaned up route mounting in `routes/leaveReviewRoutes.js` and `controllers/leaveReviewController.js` to prevent duplicate handler collisions with Sohan's approval/rejection endpoints.

4. **Testing Suite & Documentation**:
   - Live cluster verification against MongoDB Atlas (`leave_management` DB).
   - Documented 16 comprehensive Postman test scenarios covering all happy paths, edge cases, validation rejections (400), conflicts (409), and authorization boundaries (403).
   - Created standalone `postman-testing-guide.md` and updated `README.md` with complete parameter specifications and sample JSON payloads.
