import toast from '../utils/toast';

export const handleApiError = (error) => {
  console.error('API Error:', error);
  toast.error('An error occurred. Please try again.');
};

export const showSuccess = (message) => {
  toast.success(message);
};