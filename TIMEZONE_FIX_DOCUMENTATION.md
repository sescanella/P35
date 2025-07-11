# Timezone Fix for Habit Tracker App

## Problem Summary
The habit tracker app was experiencing timezone issues where:
- Records created around midnight appeared on the wrong date
- Habits marked for July 7th would appear as July 6th in the database/charts
- This affected both Santiago, Chile (UTC-3/UTC-4) and would affect Lisbon, Portugal (UTC+0/UTC+1)

## Root Cause
The original code used JavaScript's `new Date().toISOString().split('T')[0]` which:
1. Creates a Date object in local timezone
2. Converts it to UTC (which can shift the date)
3. Extracts only the date portion

This caused date shifts when the local time was close to midnight.

## Solution Implementation

### 1. Created Timezone-Safe Date Utilities (`src/utils/dateUtils.js`)
- `getCurrentLocalDate()`: Gets current date in local timezone without UTC conversion
- `createLocalDate()`: Creates Date objects at midnight local time
- `formatLocalDate()`: Formats dates with timezone awareness
- `getLastNDays()`: Gets date ranges in local timezone
- `addDays()`, `isToday()`: Helper functions for date operations

### 2. Updated Core Components
- **DailyTracker.jsx**: Now uses timezone-safe date initialization and calculations
- **HabitChart.jsx**: Uses local timezone for date ranges and streak calculations  
- **Dashboard.jsx**: Updated date loading logic for tracking data

### 3. Added Timezone Settings Component (`src/components/TimezoneSettings.jsx`)
- Allows users to set preferred timezone
- Useful when traveling or moving between countries
- Supports Santiago, Chile → Lisbon, Portugal transition
- Saves preference in localStorage

### 4. Debug Component (`src/components/DateDebugInfo.jsx`)
- Shows current timezone information
- Compares old vs new date handling
- Helps verify fixes are working correctly

## Key Changes Made

### Before (Problematic):
```javascript
const selectedDate = new Date().toISOString().split('T')[0] // Can shift timezone
const date = new Date(dateString) // Assumes UTC midnight
```

### After (Fixed):
```javascript
const selectedDate = getCurrentLocalDate() // Always local timezone
const date = createLocalDate(dateString) // Local midnight
```

## Files Modified
1. `src/utils/dateUtils.js` - New timezone utilities
2. `src/components/DailyTracker.jsx` - Updated date handling
3. `src/components/HabitChart.jsx` - Fixed chart date calculations
4. `src/pages/Dashboard.jsx` - Updated tracking data loading
5. `src/components/TimezoneSettings.jsx` - New timezone preference component
6. `src/components/DateDebugInfo.jsx` - Debug component

## Benefits
- ✅ Dates now match user's local timezone consistently
- ✅ No more records appearing on wrong dates
- ✅ Works correctly in Santiago, Chile (UTC-3/UTC-4)
- ✅ Will work correctly in Lisbon, Portugal (UTC+0/UTC+1)
- ✅ User can manually set timezone preference when traveling
- ✅ Maintains database compatibility (still stores dates as YYYY-MM-DD)

## Usage Instructions

### For Santiago → Lisbon Move:
1. Click the timezone settings button (🕐) in the top-right
2. Select "🇵🇹 Lisboa, Portugal (UTC+0/+1)" 
3. App will use Lisbon timezone for all future date operations
4. Existing records remain unchanged

### Testing the Fix:
1. Check the debug info panel (bottom-right)
2. Verify "Old way" and "New way" dates match
3. If they don't match around midnight, the fix is working correctly
4. Create a habit record around midnight and verify it appears on the correct date

## Technical Notes
- Database schema remains unchanged
- All date storage still uses YYYY-MM-DD format
- Only JavaScript date handling logic was modified
- Backwards compatible with existing data
- Timezone preference is stored in browser localStorage

## Future Considerations
- Could add automatic timezone detection based on IP geolocation
- Could add timezone change notifications when system timezone changes
- Could add date range validation for extreme timezone differences
