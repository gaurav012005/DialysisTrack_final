import toast from 'react-hot-toast';

const toastConfig = {
    success: {
        duration: 3000,
        icon: '✓',
        style: {
            background: '#065f46',
            border: '1px solid #10b981',
            color: '#d1fae5',
            padding: '14px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            maxWidth: '380px',
            wordBreak: 'break-word',
        },
    },
    error: {
        duration: 4000,
        icon: '✗',
        style: {
            background: '#7f1d1d',
            border: '1px solid #ef4444',
            color: '#fecaca',
            padding: '14px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            maxWidth: '380px',
            wordBreak: 'break-word',
        },
    },
    warning: {
        duration: 3500,
        icon: '⚠',
        style: {
            background: '#78350f',
            border: '1px solid #f59e0b',
            color: '#fef3c7',
            padding: '14px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            maxWidth: '380px',
            wordBreak: 'break-word',
        },
    },
    info: {
        duration: 3000,
        icon: 'ⓘ',
        style: {
            background: '#164e63',
            border: '1px solid #06b6d4',
            color: '#cffafe',
            padding: '14px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            maxWidth: '380px',
            wordBreak: 'break-word',
        },
    },
    loading: {
        icon: '⌛',
        style: {
            background: '#312e81',
            border: '1px solid #818cf8',
            color: '#e0e7ff',
            padding: '14px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            maxWidth: '380px',
            wordBreak: 'break-word',
        },
    },
};

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

export const dismissAllToasts = () => toast.dismiss();
export const dismissToast = (toastId) => toast.dismiss(toastId);

export default showToast;
