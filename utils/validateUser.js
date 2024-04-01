function validateUser(userData) {
  const errors = [];

  // Name validation
  if (!userData.name || userData.name.trim().length < 3) {
    errors.push('Name is required and must be at least 3 characters long');
  }

  // Phone validation
  if (!userData.phone || !Number(userData.name.trim()).length == 11) {
    errors.push('Phone number is required and must be 11 digits');
  }

  // Email validation
  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Invalid email format');
  }

  // Password validation
  if (!userData.password || userData.password.length < 4) {
    errors.push('Password is required and must be at least 4 characters long');
  }

  // Return a clear message with all errors
  if (errors.length) {
    return 'Validation errors: ' + errors.join(', ');
  }

  return null; // No validation errors
}

module.exports = validateUser;
