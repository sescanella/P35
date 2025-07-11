/**
 * Test file to verify timezone-safe date utilities
 * This helps ensure dates are handled correctly in Santiago, Chile (UTC-3/UTC-4)
 */

import { 
  getCurrentLocalDate, 
  createLocalDate, 
  formatLocalDate, 
  getLastNDays, 
  isToday,
  addDays 
} from '../utils/dateUtils.js';

// Test the utilities
console.log('=== Date Utilities Test ===');
console.log('Current local date:', getCurrentLocalDate());
console.log('Is today check:', isToday(getCurrentLocalDate()));

const testDate = '2025-07-08';
console.log('Test date:', testDate);
console.log('Formatted date:', formatLocalDate(testDate));
console.log('Create local date:', createLocalDate(testDate));

const last7Days = getLastNDays(7);
console.log('Last 7 days:', last7Days);

console.log('Add 1 day to test date:', addDays(testDate, 1));
console.log('Subtract 1 day from test date:', addDays(testDate, -1));

// Simulate timezone conversion issue
const oldWay = new Date().toISOString().split('T')[0];
const newWay = getCurrentLocalDate();
console.log('=== Comparison ===');
console.log('Old way (can shift timezone):', oldWay);
console.log('New way (timezone-safe):', newWay);
console.log('Same result?', oldWay === newWay);

export { }; // Make this a module
