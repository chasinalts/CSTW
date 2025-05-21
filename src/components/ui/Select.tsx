import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'multiple'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  isMulti?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      isMulti = false,
      isLoading = false,
      placeholder,
      icon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseSelectStyles = `
      block rounded-md border shadow-sm appearance-none
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:border-gray-200 dark:disabled:border-gray-600 disabled:cursor-not-allowed
      ${icon ? 'pl-10' : 'pl-4'}
      pr-10 py-2
      ${fullWidth ? 'w-full' : 'w-auto'}
      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
    `;

    const variants = {
      normal: 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 dark:text-red-400'
    };

    const labelId = props.id ? `${props.id}-label` : undefined;
    const errorId = props.id ? `${props.id}-error` : undefined;
    const helperId = props.id ? `${props.id}-helper` : undefined;

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
        {label && (
          <label
            htmlFor={props.id}
            id={labelId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            multiple={isMulti}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            disabled={disabled || isLoading}
            className={`
              ${baseSelectStyles}
              ${variants[error ? 'error' : 'normal']}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {isLoading ? 'Loading...' : placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            {isLoading ? (
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </motion.svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        </div>
        {(error || helperText) && (
          <div className="mt-1">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                id={errorId}
                className="text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </motion.p>
            )}
            {!error && helperText && (
              <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;