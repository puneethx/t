// Guest itinerary storage utility for managing temporary itineraries in localStorage and session storage

const GUEST_ITINERARIES_KEY = 'traveltrove_guest_itineraries';
const DRAFT_ITINERARIES_KEY = 'traveltrove_draft_itineraries';
const VISITOR_ID_KEY = 'traveltrove_visitor_id';

// Generate or retrieve visitor ID for session isolation
const getVisitorId = () => {
  let visitorId = sessionStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
};

// Get visitor-specific draft key
const getDraftKey = () => {
  const visitorId = getVisitorId();
  return `${DRAFT_ITINERARIES_KEY}_${visitorId}`;
};

export const guestStorage = {
  // Save a guest itinerary to localStorage (existing functionality)
  saveItinerary: (itinerary) => {
    try {
      const existingItineraries = guestStorage.getItineraries();
      const newItinerary = {
        ...itinerary,
        id: itinerary._id || `guest-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isGuest: true
      };
      
      // Check if itinerary already exists (update scenario)
      const existingIndex = existingItineraries.findIndex(item => item.id === newItinerary.id);
      
      if (existingIndex !== -1) {
        existingItineraries[existingIndex] = newItinerary;
      } else {
        existingItineraries.push(newItinerary);
      }
      
      localStorage.setItem(GUEST_ITINERARIES_KEY, JSON.stringify(existingItineraries));
      return newItinerary;
    } catch (error) {
      console.error('Error saving guest itinerary:', error);
      return null;
    }
  },

  // Get all guest itineraries from localStorage (existing functionality)
  getItineraries: () => {
    try {
      const stored = localStorage.getItem(GUEST_ITINERARIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving guest itineraries:', error);
      return [];
    }
  },

  // Get a specific guest itinerary by ID (existing functionality)
  getItinerary: (id) => {
    try {
      const itineraries = guestStorage.getItineraries();
      return itineraries.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error retrieving guest itinerary:', error);
      return null;
    }
  },

  // Remove a guest itinerary (existing functionality)
  removeItinerary: (id) => {
    try {
      const itineraries = guestStorage.getItineraries();
      const filtered = itineraries.filter(item => item.id !== id);
      localStorage.setItem(GUEST_ITINERARIES_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing guest itinerary:', error);
      return false;
    }
  },

  // Clear all guest itineraries (existing functionality)
  clearItineraries: () => {
    try {
      localStorage.removeItem(GUEST_ITINERARIES_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing guest itineraries:', error);
      return false;
    }
  },

  // Transfer guest itineraries to user account (existing functionality)
  transferToUserAccount: async (apiCall) => {
    try {
      const guestItineraries = guestStorage.getItineraries();
      const transferResults = [];

      for (const itinerary of guestItineraries) {
        try {
          // Remove guest-specific properties
          const { id, isGuest, createdAt, ...itineraryData } = itinerary;
          
          // Create the itinerary via API
          const response = await apiCall(itineraryData);
          transferResults.push({ success: true, original: itinerary, saved: response.data });
        } catch (error) {
          console.error('Error transferring itinerary:', error);
          transferResults.push({ success: false, original: itinerary, error });
        }
      }

      // Clear guest storage after successful transfers
      if (transferResults.some(result => result.success)) {
        guestStorage.clearItineraries();
      }

      return transferResults;
    } catch (error) {
      console.error('Error transferring guest itineraries:', error);
      return [];
    }
  },

  // NEW: Draft itineraries functionality using session storage with visitor isolation

  // Save a draft itinerary to session storage (visitor-specific)
  saveDraftItinerary: (itinerary) => {
    try {
      const existingDrafts = guestStorage.getDraftItineraries();
      const newDraft = {
        ...itinerary,
        id: itinerary._id || `draft-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isDraft: true,
        visitorId: getVisitorId()
      };
      
      // Check if draft already exists (update scenario)
      const existingIndex = existingDrafts.findIndex(item => item.id === newDraft.id);
      
      if (existingIndex !== -1) {
        existingDrafts[existingIndex] = newDraft;
      } else {
        existingDrafts.push(newDraft);
      }
      
      sessionStorage.setItem(getDraftKey(), JSON.stringify(existingDrafts));
      return newDraft;
    } catch (error) {
      console.error('Error saving draft itinerary:', error);
      return null;
    }
  },

  // Get all draft itineraries from session storage (visitor-specific)
  getDraftItineraries: () => {
    try {
      const stored = sessionStorage.getItem(getDraftKey());
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving draft itineraries:', error);
      return [];
    }
  },

  // Get a specific draft itinerary by ID (visitor-specific)
  getDraftItinerary: (id) => {
    try {
      const drafts = guestStorage.getDraftItineraries();
      return drafts.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error retrieving draft itinerary:', error);
      return null;
    }
  },

  // Remove a draft itinerary (visitor-specific)
  removeDraftItinerary: (id) => {
    try {
      const drafts = guestStorage.getDraftItineraries();
      const filtered = drafts.filter(item => item.id !== id);
      sessionStorage.setItem(getDraftKey(), JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing draft itinerary:', error);
      return false;
    }
  },

  // Clear all draft itineraries for current visitor
  clearDraftItineraries: () => {
    try {
      sessionStorage.removeItem(getDraftKey());
      return true;
    } catch (error) {
      console.error('Error clearing draft itineraries:', error);
      return false;
    }
  },

  // Clear all draft itineraries for all visitors (admin function)
  clearAllDraftItineraries: () => {
    try {
      // Get all session storage keys that start with the draft key prefix
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
      });
      
      console.log(`Cleared ${keysToRemove.length} draft itinerary storage keys`);
      return true;
    } catch (error) {
      console.error('Error clearing all draft itineraries:', error);
      return false;
    }
  },

  // Get visitor ID for debugging/logging purposes
  getVisitorId: () => getVisitorId(),

  // Transfer draft itineraries to user account (similar to guest transfer)
  transferDraftsToUserAccount: async (apiCall) => {
    try {
      const draftItineraries = guestStorage.getDraftItineraries();
      const transferResults = [];

      for (const itinerary of draftItineraries) {
        try {
          // Remove draft-specific properties
          const { id, isDraft, createdAt, visitorId, ...itineraryData } = itinerary;
          
          // Create the itinerary via API
          const response = await apiCall(itineraryData);
          transferResults.push({ success: true, original: itinerary, saved: response.data });
        } catch (error) {
          console.error('Error transferring draft itinerary:', error);
          transferResults.push({ success: false, original: itinerary, error });
        }
      }

      // Clear draft storage after successful transfers
      if (transferResults.some(result => result.success)) {
        guestStorage.clearDraftItineraries();
      }

      return transferResults;
    } catch (error) {
      console.error('Error transferring draft itineraries:', error);
      return [];
    }
  },

  // Simple function to delete all drafts (can be called from anywhere)
  deleteAllDrafts: () => {
    console.log('Deleting all draft itineraries...');
    return guestStorage.clearAllDraftItineraries();
  }
};

export default guestStorage;
