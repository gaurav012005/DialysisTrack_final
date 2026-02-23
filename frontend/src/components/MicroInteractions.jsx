import React, { useState } from 'react';

// Ripple Effect Component
export const RippleButton = ({ children, onClick, className = '', disabled = false, ...props }) => {
    const [ripples, setRipples] = useState([]);

    const addRipple = (event) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const newRipple = {
            x,
            y,
            size,
            id: Date.now(),
        };

        setRipples([...ripples, newRipple]);

        setTimeout(() => {
            setRipples((prevRipples) => prevRipples.filter((r) => r.id !== newRipple.id));
        }, 600);

        if (onClick) onClick(event);
    };

    return (
        <button
            className={`relative overflow-hidden ${className}`}
            onClick={addRipple}
            disabled={disabled}
            {...props}
        >
            {children}
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                />
            ))}
        </button>
    );
};

// Loading Button Component
export const LoadingButton = ({
    children,
    loading = false,
    onClick,
    className = '',
    disabled = false,
    loadingText = 'Loading...',
    ...props
}) => {
    return (
        <button
            className={`relative ${className} ${loading ? 'cursor-wait' : ''}`}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </span>
            )}
            <span className={loading ? 'invisible' : ''}>{children}</span>
        </button>
    );
};

// Progress Bar Component
export const ProgressBar = ({
    current,
    total,
    showLabel = true,
    className = '',
    color = 'bg-primary-600'
}) => {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-gray-700 dark:text-gray-300">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-2.5 ${color} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
};

// Step Progress Component
export const StepProgress = ({ steps, currentStep, className = '' }) => {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${index < currentStep
                                    ? 'bg-green-500 text-white'
                                    : index === currentStep
                                        ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            {index < currentStep ? '✓' : index + 1}
                        </div>
                        <span className={`mt-2 text-xs ${index <= currentStep ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded">
                            <div
                                className={`h-full rounded transition-all duration-500 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                style={{ width: index < currentStep ? '100%' : '0%' }}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// Animated Icon Component
export const AnimatedIcon = ({ icon, className = '', animate = 'bounce' }) => {
    const animations = {
        bounce: 'animate-bounce',
        pulse: 'animate-pulse',
        spin: 'animate-spin',
        ping: 'animate-ping',
    };

    return (
        <span className={`inline-block ${animations[animate] || ''} ${className}`}>
            {icon}
        </span>
    );
};

// Confirmation Dialog Component
export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning' // warning, danger, info
}) => {
    if (!isOpen) return null;

    const typeColors = {
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    };

    const buttonColors = {
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        danger: 'bg-red-600 hover:bg-red-700',
        info: 'bg-blue-600 hover:bg-blue-700',
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
        >
            <div
                className={`bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-2 ${typeColors[type]} animate-scaleIn`}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="dialog-title" className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${buttonColors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default {
    RippleButton,
    LoadingButton,
    ProgressBar,
    StepProgress,
    AnimatedIcon,
    ConfirmDialog,
};
