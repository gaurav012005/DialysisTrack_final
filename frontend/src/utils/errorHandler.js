export const handleApiError = (error) => {
  console.error('API Error:', error);
  alert('An error occurred. Please try again.');
};

export const showSuccess = (message) => {
  alert(message);
};