import React from 'react';

const EmptyState = ({
  icon = '📋',
  title = 'No data available',
  description = 'Get started by adding your first item',
  action,
  actionLabel = 'Add New',
  onAction,
  secondaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {/* Icon */}
      <div className="text-6xl mb-4 animate-float">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {action || (onAction && (
          <button
            onClick={onAction}
            className="btn-primary"
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        ))}

        {secondaryAction || (onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="btn-secondary"
            aria-label={secondaryActionLabel}
          >
            {secondaryActionLabel}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;