// Validation utility functions for forms

export const emailValidation = {
  required: 'Email is required',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address'
  }
};

export const passwordValidation = {
  required: 'Password is required',
  minLength: {
    value: 6,
    message: 'Password must be at least 6 characters'
  }
};

export const nameValidation = {
  required: 'This field is required',
  minLength: {
    value: 2,
    message: 'Must be at least 2 characters'
  },
  maxLength: {
    value: 50,
    message: 'Must be less than 50 characters'
  }
};

export const urlValidation = {
  pattern: {
    value: /^https?:\/\/.+\..+/,
    message: 'Please enter a valid URL'
  }
};

export const coordinateValidation = {
  pattern: {
    value: /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/,
    message: 'Please enter valid coordinates'
  }
};

export const budgetValidation = {
  min: {
    value: 0,
    message: 'Budget cannot be negative'
  },
  max: {
    value: 1000000,
    message: 'Budget seems unrealistic'
  }
};

export const groupSizeValidation = {
  min: {
    value: 1,
    message: 'Group size must be at least 1'
  },
  max: {
    value: 100,
    message: 'Group size cannot exceed 100'
  }
};

export const dateValidation = {
  required: 'Date is required',
  validate: {
    notPast: (value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      return selectedDate >= today || 'Date cannot be in the past';
    }
  }
};

export const endDateValidation = (startDate) => ({
  required: 'End date is required',
  validate: {
    afterStart: (value) => {
      if (!startDate) return true;
      const start = new Date(startDate);
      const end = new Date(value);
      return end >= start || 'End date must be after start date';
    }
  }
});

export const ratingValidation = {
  required: 'Rating is required',
  min: {
    value: 1,
    message: 'Rating must be at least 1'
  },
  max: {
    value: 5,
    message: 'Rating cannot exceed 5'
  }
};

export const textAreaValidation = {
  maxLength: {
    value: 1000,
    message: 'Text cannot exceed 1000 characters'
  }
};

export const titleValidation = {
  required: 'Title is required',
  minLength: {
    value: 3,
    message: 'Title must be at least 3 characters'
  },
  maxLength: {
    value: 100,
    message: 'Title cannot exceed 100 characters'
  }
};

// Helper function to validate file uploads
export const validateFileUpload = (file, maxSize = 5 * 1024 * 1024) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed';
  }
  
  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }
  
  return null;
};

// Helper function to sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Helper function to validate arrays
export const validateArray = (array, minLength = 0, maxLength = 10) => {
  const filtered = array.filter(item => item && item.trim());
  
  if (filtered.length < minLength) {
    return `At least ${minLength} items required`;
  }
  
  if (filtered.length > maxLength) {
    return `Maximum ${maxLength} items allowed`;
  }
  
  return null;
};
