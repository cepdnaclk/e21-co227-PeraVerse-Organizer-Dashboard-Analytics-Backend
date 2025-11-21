require('dotenv').config();

/**
 * Returns the exhibition start date in YYYY-MM-DD format.
 * Priority:
 *    Value from environment variable EXHIBITION_START_DATE
 *  
 */
function getStartDate() {
	// Read from environment or fallback to default
	const d = process.env.EXHIBITION_START_DATE || '2025-10-28';
	return d;
}

/**
 * Given a day index (starting from 1), returns the actual calendar date
 * relative to the exhibition start date.
 *
 * Example:
 *   Day 1 -> Start date
 *   Day 2 -> Start date + 1 day
 *   Day 5 -> Start date + 4 days
 *
 * @param {number|string} day - The exhibition day number (1-based)
 * @returns {string|null} Date string in 'YYYY-MM-DD' format or null if invalid
 */
function getDateForDay(day) {
	// Validate day input
	if (!day) return null;

	// Convert start date string to a Date object
	const start = new Date(getStartDate());

	// Guarntee the start date is valid
	if (Number.isNaN(start.getTime())) return null;

	// Convert day to a usable number
	const idx = Number(day);

	// Validate that day is a positive finite number
	if (!Number.isFinite(idx) || idx < 1) return null;

	// Clone start date and adjust by (day - 1)
	const date = new Date(start);
	date.setDate(start.getDate() + (idx - 1));

	// Format the resulting date as YYYY-MM-DD
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
	const dd = String(date.getDate()).padStart(2, '0');

	return `${yyyy}-${mm}-${dd}`;
}

// Export the functions so they can be used in other modules
module.exports = { getStartDate, getDateForDay };
