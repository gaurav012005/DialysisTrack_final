import toast from 'react-hot-toast';

// Medical-themed toast configurations
const toastConfig = {
    success: {
        duration: 3000,
        icon: '✓',
        style: {
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#059669',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1), 0 8px 16px rgba(16, 185, 129, 0.08)',
        },
    },
    error: {
        duration: 4000,
        icon: '✗',
        style: {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.15) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1), 0 8px 16px rgba(239, 68, 68, 0.08)',
        },
    },
    warning: {
        duration: 3500,
        icon: '⚠',
        style: {
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#d97706',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(245, 158, 11, 0.1), 0 8px 16px rgba(245, 158, 11, 0.08)',
        },
    },
    info: {
        duration: 3000,
        icon: 'ⓘ',
        style: {
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.15) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#0e7490',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(8, 145, 178, 0.1), 0 8px 16px rgba(8, 145, 178, 0.08)',
        },
    },
    loading: {
        icon: '⌛',
        style: {
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#4f46e5',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(99, 102, 241, 0.1), 0 8px 16px rgba(99, 102, 241, 0.08)',
        },
    },
};

// Custom toast functions
export const showToast = {
    success: (message) => toast.success(message, toastConfig.success),
    error: (message) => toast.error(message, toastConfig.error),
    warning: (message) => toast(message, { ...toastConfig.warning, icon: '⚠' }),
    info: (message) => toast(message, { ...toastConfig.info, icon: 'ⓘ' }),
    loading: (message) => toast.loading(message, toastConfig.loading),
    promise: (promise, messages) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading || 'Processing...',
                success: messages.success || 'Success!',
                error: messages.error || 'Error occurred',
            },
            {
                success: toastConfig.success,
                error: toastConfig.error,
                loading: toastConfig.loading,
            }
        );
    },
};

// Dismiss all toasts
export const dismissAllToasts = () => toast.dismiss();

// Dismiss specific toast
export const dismissToast = (toastId) => toast.dismiss(toastId);

export default showToast;
