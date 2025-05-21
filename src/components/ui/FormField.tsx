import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children?: ReactNode;
  fullWidth?: boolean;
}

const FormField = ({
  label,
  error,
  helperText,
  required,
  children,
  fullWidth = false
}: FormFieldProps) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="mt-1">{children}</div>

      {(error || helperText) && (
        <div className="mt-1">
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
            >
              {error}
            </motion.p>
          ) : helperText ? (
            <p className="text-sm text-gray-500">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

type InputFieldProps = Omit<FormFieldProps, 'children'> & JSX.IntrinsicElements['input'];
type TextAreaFieldProps = Omit<FormFieldProps, 'children'> & JSX.IntrinsicElements['textarea'];
type SelectFieldProps = Omit<FormFieldProps, 'children'> & JSX.IntrinsicElements['select'] & {
  children: ReactNode;
};

// Additional helper components for common field types
export const TextField = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  ...inputProps
}: InputFieldProps) => {
  return (
    <FormField
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
    >
      <input
        className={`
          block rounded-md shadow-sm
          ${fullWidth ? 'w-full' : 'w-auto'}
          ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          disabled:bg-gray-50 disabled:text-gray-500
        `}
        {...inputProps}
      />
    </FormField>
  );
};

export const TextArea = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  ...textareaProps
}: TextAreaFieldProps) => {
  return (
    <FormField
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
    >
      <textarea
        className={`
          block rounded-md shadow-sm
          ${fullWidth ? 'w-full' : 'w-auto'}
          ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          disabled:bg-gray-50 disabled:text-gray-500
        `}
        {...textareaProps}
      />
    </FormField>
  );
};

export const SelectField = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  children,
  ...selectProps
}: SelectFieldProps) => {
  return (
    <FormField
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
    >
      <select
        className={`
          block rounded-md shadow-sm
          ${fullWidth ? 'w-full' : 'w-auto'}
          ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          disabled:bg-gray-50 disabled:text-gray-500
        `}
        {...selectProps}
      >
        {children}
      </select>
    </FormField>
  );
};

export const CheckboxField = ({
  label,
  error,
  helperText,
  required,
  ...checkboxProps
}: InputFieldProps) => {
  return (
    <FormField
      error={error}
      helperText={helperText}
      required={required}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          className={`
            rounded border-gray-300 text-blue-600 shadow-sm
            focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50
            ${error ? 'border-red-500' : ''}
          `}
          {...checkboxProps}
        />
        {label && (
          <label className="ml-2 block text-sm text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
    </FormField>
  );
};

export default FormField;