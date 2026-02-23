/**
 * Authentication utilities for role-based access control
 */

/**
 * Check if user has admin role
 * @param {Object} user - User object from login response
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

/**
 * Check if user has student role
 * @param {Object} user - User object from login response
 * @returns {boolean} True if user is student
 */
export const isStudent = (user) => {
  return user && user.role === 'student';
};

/**
 * Get redirect path based on user role
 * @param {Object} user - User object from login response
 * @returns {string} Path to redirect to
 */
export const getRedirectPath = (user) => {
  if (isAdmin(user)) {
    return '/dashboard';
  } else {
    return '/pending';
  }
};

/**
 * Check if tokens exist in localStorage
 * @returns {boolean} True if both tokens exist
 */
export const hasValidTokens = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!(accessToken && refreshToken);
};

/**
 * Get user data from localStorage
 * @returns {Object|null} Parsed user object or null
 */
export const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/**
 * Validate login response structure
 * @param {Object} response - Login API response
 * @returns {boolean} True if response has required fields
 */
export const validateLoginResponse = (response) => {
  return (
    response &&
    response.success === true &&
    response.accessToken &&
    response.refreshToken &&
    response.user &&
    response.user._id &&
    response.user.role &&
    response.user.username
  );
};