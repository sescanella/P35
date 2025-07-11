/**
 * Date utilities for consistent timezone handling in the habit tracker app.
 * 
 * These utilities ensure that dates are always handled in the user's local timezone,
 * preventing issues where dates shift when converted to/from UTC.
 */

// Optional: Store user's timezone preference (useful when moving between timezones)
let userTimezone = null;

/**
 * Sets a specific timezone for the user (optional)
 * Useful when user moves between timezones and wants consistent behavior
 * @param {string} timezone - IANA timezone string (e.g., 'America/Santiago', 'Europe/Lisbon')
 */
export function setUserTimezone(timezone) {
  try {
    // Validate timezone
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    userTimezone = timezone;
    console.log('Timezone set to:', timezone);
  } catch (error) {
    console.warn('Invalid timezone:', timezone);
    userTimezone = null;
  }
}

/**
 * Gets the effective timezone (user preference or system default)
 * @returns {string} IANA timezone string
 */
export function getEffectiveTimezone() {
  return userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Gets the current date in YYYY-MM-DD format in the user's local timezone
 * @returns {string} Current date in YYYY-MM-DD format
 */
export function getCurrentLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a date string to a Date object at midnight in local timezone
 * This prevents timezone shifts when working with date-only values
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Date} Date object at midnight local time
 */
export function createLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a date string for display in the user's locale
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatLocalDate(dateString, options = {}) {
  const date = createLocalDate(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: getEffectiveTimezone()
  };
  // Use Chilean date format (DD/MM/YYYY) instead of US format (MM/DD/YYYY)
  return date.toLocaleDateString('es-CL', { ...defaultOptions, ...options });
}

/**
 * Gets an array of dates going back N days from today in local timezone
 * @param {number} days - Number of days to go back (default: 21)
 * @returns {string[]} Array of date strings in YYYY-MM-DD format
 */
export function getLastNDays(days = 21) {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    dates.push(`${year}-${month}-${day}`);
  }
  
  return dates;
}

/**
 * Checks if a date string represents today in local timezone
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export function isToday(dateString) {
  return dateString === getCurrentLocalDate();
}

/**
 * Gets the day of week for a date string (0 = Sunday, 6 = Saturday)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {number} Day of week (0-6)
 */
export function getDayOfWeek(dateString) {
  return createLocalDate(dateString).getDay();
}

/**
 * Adds/subtracts days to a date string
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} days - Number of days to add (positive) or subtract (negative)
 * @returns {string} New date in YYYY-MM-DD format
 */
export function addDays(dateString, days) {
  const date = createLocalDate(dateString);
  date.setDate(date.getDate() + days);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Validates if a string is a valid date in YYYY-MM-DD format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date format
 */
export function isValidDateString(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = createLocalDate(dateString);
  const [year, month, day] = dateString.split('-').map(Number);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

/**
 * Converts a Date object to YYYY-MM-DD format in local timezone
 * @param {Date} date - Date object
 * @returns {string} Date in YYYY-MM-DD format
 */
export function dateToLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets current timestamp in ISO format but for local timezone context
 * Useful for debugging and logging
 * @returns {string} Current timestamp in ISO format
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}
