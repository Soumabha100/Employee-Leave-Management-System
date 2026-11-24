/**
 * Application-wide constants.
 * Deeply frozen to prevent runtime mutation.
 */
const CONSTANTS = Object.freeze({
  ROLES: Object.freeze({
    ADMIN: 'admin',
    HR: 'hr',
    EMPLOYEE: 'employee',
  }),
  LEAVE_TYPES: Object.freeze(['sick', 'casual', 'annual']),
  LEAVE_STATUS: Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  }),
  ATTENDANCE_STATUS: Object.freeze({
    PRESENT: 'present',
    LATE: 'late',
    ABSENT: 'absent',
  }),
  DEFAULT_BALANCES: Object.freeze({
    sick: 10,
    casual: 8,
    annual: 15,
  }),
  OFFICE_START: Object.freeze({
    hour: 9,
    minute: 30,
  }),
  TZ_OFFSET_MINUTES: 330,
  PAGINATION: Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  }),
});

module.exports = CONSTANTS;
