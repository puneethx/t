// Utility script to clear all draft itineraries from session storage
// Run this in the browser console to delete all previously saved drafts

console.log('Clearing all draft itineraries...');

// Clear all session storage keys that start with the draft key prefix
const DRAFT_ITINERARIES_KEY = 'traveltrove_draft_itineraries';
const keysToRemove = [];

for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && key.startsWith(DRAFT_ITINERARIES_KEY)) {
    keysToRemove.push(key);
  }
}

// Remove all draft-related keys
keysToRemove.forEach(key => {
  sessionStorage.removeItem(key);
  console.log(`Removed: ${key}`);
});

console.log(`Successfully cleared ${keysToRemove.length} draft itinerary storage keys`);

// Also clear visitor IDs if you want to reset visitor tracking
const visitorKeys = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && key.includes('visitor_id')) {
    visitorKeys.push(key);
  }
}

visitorKeys.forEach(key => {
  sessionStorage.removeItem(key);
  console.log(`Removed visitor ID: ${key}`);
});

console.log(`Also cleared ${visitorKeys.length} visitor ID keys`);
console.log('All draft itineraries have been deleted!');
