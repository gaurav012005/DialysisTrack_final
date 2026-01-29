// Utility to clear cached authentication data
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  console.log('Authentication data cleared. Please login again.');
};

// Check if token exists and is valid format
export const validateTokenFormat = (token) => {
  if (!token) return false;

  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Try to decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('Token is expired');
      return false;
    }

    return true;
  } catch (e) {
    console.log('Invalid token format');
    return false;
  }
};

// Auto-clear invalid tokens
export const checkAndClearInvalidTokens = () => {
  const token = localStorage.getItem('authToken');
  if (token && !validateTokenFormat(token)) {
    console.log('Invalid token detected, clearing auth data');
    clearAuthData();
    return false;
  }
  return true;
};

export default {
  clearAuthData,
  validateTokenFormat,
  checkAndClearInvalidTokens
};