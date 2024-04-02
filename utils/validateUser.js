function validateUser(userData) {
  const errors = {};

  // Name validation
  if (!userData.name || userData.name.trim().length < 3) {
    errors.name = 'Name is required and must be at least 3 characters long';
  }

  // Phone validation
  if (
    !userData.phone ||
    userData.phone.trim().length !== 11 ||
    isNaN(Number(userData.phone.trim()))
  ) {
    errors.phone = 'Phone number is required and must be 11 digits';
  }

  // Email validation
  if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.email = 'Invalid email format';
  }

  // Password validation
  if (!userData.password || userData.password.length < 4) {
    errors.password =
      'Password is required and must be at least 4 characters long';
  }

  // Return errors object
  if (Object.keys(errors).length > 0) {
    return errors;
  }

  return null; // No validation errors
}

module.exports = validateUser;
