import React from 'react';

// Accessibility Wrapper for Skip to Content
export const SkipToContent = () => {
    return (
        <a href="#main-content" className="skip-to-content">
            Skip to main content
        </a>
    );
};

// Accessible Button with ARIA
export const AccessibleButton = ({
    children,
    onClick,
    ariaLabel,
    ariaDescribedBy,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            className={`focus-visible:outline-2 focus-visible:outline-primary-600 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// Keyboard Navigation Hook
export const useKeyboardNavigation = (handlers) => {
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            // Escape key
            if (event.key === 'Escape' && handlers.onEscape) {
                handlers.onEscape(event);
            }
            // Enter key
            if (event.key === 'Enter' && handlers.onEnter) {
                handlers.onEnter(event);
            }
            // Arrow keys
            if (event.key === 'ArrowUp' && handlers.onArrowUp) {
                event.preventDefault();
                handlers.onArrowUp(event);
            }
            if (event.key === 'ArrowDown' && handlers.onArrowDown) {
                event.preventDefault();
                handlers.onArrowDown(event);
            }
            if (event.key === 'ArrowLeft' && handlers.onArrowLeft) {
                handlers.onArrowLeft(event);
            }
            if (event.key === 'ArrowRight' && handlers.onArrowRight) {
                handlers.onArrowRight(event);
            }
            // Keyboard shortcuts (Ctrl/Cmd + key)
            if ((event.ctrlKey || event.metaKey) && handlers.shortcuts) {
                const shortcut = handlers.shortcuts[event.key.toLowerCase()];
                if (shortcut) {
                    event.preventDefault();
                    shortcut(event);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
};

// Focus Trap for Modals
export const useFocusTrap = (isActive) => {
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        container.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => container.removeEventListener('keydown', handleTab);
    }, [isActive]);

    return containerRef;
};

// Screen Reader Only Text
export const ScreenReaderOnly = ({ children }) => {
    return (
        <span className="sr-only">
            {children}
        </span>
    );
};

// Accessible Form Field
export const AccessibleFormField = ({
    label,
    id,
    error,
    required = false,
    helpText,
    children
}) => {
    const errorId = `${id}-error`;
    const helpId = `${id}-help`;

    return (
        <div className="mb-4">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
                {label}
                {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
            </label>
            {React.cloneElement(children, {
                id,
                'aria-required': required,
                'aria-invalid': !!error,
                'aria-describedby': `${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined,
            })}
            {helpText && (
                <p id={helpId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {helpText}
                </p>
            )}
            {error && (
                <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

// Live Region for Dynamic Content
export const LiveRegion = ({ children, politeness = 'polite' }) => {
    return (
        <div
            role="status"
            aria-live={politeness}
            aria-atomic="true"
            className="sr-only"
        >
            {children}
        </div>
    );
};

// Keyboard Shortcuts Display
export const KeyboardShortcuts = ({ shortcuts }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    useKeyboardNavigation({
        shortcuts: {
            '?': () => setIsOpen(!isOpen),
        },
    });

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="shortcuts-title" className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Keyboard Shortcuts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                            <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="mt-4 w-full btn-primary"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default {
    SkipToContent,
    AccessibleButton,
    useKeyboardNavigation,
    useFocusTrap,
    ScreenReaderOnly,
    AccessibleFormField,
    LiveRegion,
    KeyboardShortcuts,
};
