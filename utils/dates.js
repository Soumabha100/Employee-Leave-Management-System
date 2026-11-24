const AppError = require('./AppError');
const { TZ_OFFSET_MINUTES } = require('../config/constants');

/**
 * Parses and strictly validates a date parameter string in YYYY-MM-DD format.
 * Rejects non-strings and impossible calendar dates (e.g. 2026-02-30).
 *
 * @param {string} value - Date string in YYYY-MM-DD format.
 * @param {string} name - Parameter name used in error message.
 * @returns {Date} Date object at 00:00:00.000 UTC for that calendar day.
 * @throws {AppError} 400 with "<name> must be a valid date in YYYY-MM-DD format".
 */
const parseDateParam = (value, name) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(`${name} must be a valid date in YYYY-MM-DD format`, 400);
  }

  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    throw new AppError(`${name} must be a valid date in YYYY-MM-DD format`, 400);
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new AppError(`${name} must be a valid date in YYYY-MM-DD format`, 400);
  }

  return date;
};

/**
 * Returns a 00:00:00.000 UTC Date representing the calendar day of the given instant
 * in the configured office timezone (Asia/Kolkata, UTC+5:30).
 *
 * @param {Date|number|string} [date=new Date()] - The instant to compute start of day for.
 * @returns {Date} 00:00:00.000 UTC Date representing the office calendar day.
 */
const startOfDay = (date = new Date()) => {
  const instant = date instanceof Date ? date : new Date(date);
  const shifted = new Date(instant.getTime() + TZ_OFFSET_MINUTES * 60000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  return new Date(Date.UTC(year, month, day));
};

/**
 * Calculates the number of minutes elapsed since midnight in the configured office timezone.
 *
 * @param {Date|number|string} [date=new Date()] - Instant to calculate from.
 * @returns {number} Minutes elapsed since midnight in office timezone.
 */
const minutesSinceMidnight = (date = new Date()) => {
  const instant = date instanceof Date ? date : new Date(date);
  const shifted = new Date(instant.getTime() + TZ_OFFSET_MINUTES * 60000);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
};

/**
 * Calculates whole calendar days from fromDate to toDate inclusive (same day returns 1).
 *
 * @param {Date|string} fromDate - Starting calendar date.
 * @param {Date|string} toDate - Ending calendar date.
 * @returns {number} Number of inclusive calendar days.
 * @throws {AppError} 400 if toDate is earlier than fromDate.
 */
const daysBetweenInclusive = (fromDate, toDate) => {
  const d1 = startOfDay(fromDate);
  const d2 = startOfDay(toDate);

  if (d2.getTime() < d1.getTime()) {
    throw new AppError('toDate cannot be before fromDate', 400);
  }

  const diffMs = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

module.exports = {
  parseDateParam,
  startOfDay,
  minutesSinceMidnight,
  daysBetweenInclusive,
};
