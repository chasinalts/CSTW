import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  indeterminate?: boolean;
}

// Checkbox component with support for indeterminate state
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, indeterminate, className = '', ...props }, ref) => {
    const inputRef = (node: HTMLInputElement | null) => {
      if (node) {
        node.indeterminate = indeterminate ?? false;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }
    };

    const labelId = props.id ? `${props.id}-label` : undefined;
    const errorId = props.id ? `${props.id}-error` : undefined;
    const helperId = props.id ? `${props.id}-helper` : undefined;

    return (
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={inputRef}
            type="checkbox"
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`
              h-4 w-4 rounded border-gray-300 text-blue-600
              focus:ring-blue-500 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {(label || error || helperText) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={props.id}
                id={labelId}
                className={`text-sm font-medium ${props.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {label}
              </label>
            )}
            {(error || helperText) && (
              <div className="mt-1">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    id={errorId}
                    className="text-sm text-red-600"
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
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio component that matches Checkbox styling
interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const labelId = props.id ? `${props.id}-label` : undefined;
    const errorId = props.id ? `${props.id}-error` : undefined;
    const helperId = props.id ? `${props.id}-helper` : undefined;

    return (
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`
              h-4 w-4 border-gray-300 text-blue-600
              focus:ring-blue-500 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {(label || error || helperText) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={props.id}
                id={labelId}
                className={`text-sm font-medium ${props.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {label}
              </label>
            )}
            {(error || helperText) && (
              <div className="mt-1">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    id={errorId}
                    className="text-sm text-red-600"
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
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// Radio Group component for managing radio button groups
interface RadioGroupProps {
  children: ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
  vertical?: boolean;
}

export const RadioGroup = ({
  children,
  label,
  error,
  helperText,
  vertical = false
}: RadioGroupProps) => {
  return (
    <div role="radiogroup" aria-label={label}>
      {label && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</div>
      )}
      <div className={`space-${vertical ? 'y' : 'x'}-4`}>{children}</div>
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}
          {!error && helperText && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkbox;