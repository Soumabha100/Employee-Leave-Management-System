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
