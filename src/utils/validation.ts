import { getLoginAttempts } from './security';

type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  custom?: (value: unknown) => boolean | string;
};

export type ValidationRules = {
  [field: string]: ValidationRule;
};

export type ValidationErrors = {
  [field: string]: string;
};

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Enhanced password validation regex
// Requires:
// - At least 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

export const validate = (values: Record<string, unknown>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const value = values[field];
    const fieldRules = rules[field];

    // Required check
    if (fieldRules.required && !value) {
      errors[field] = 'This field is required';
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) {
      return;
    }

    // String validations
    if (typeof value === 'string') {
      // MinLength check
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `Must be at least ${fieldRules.minLength} characters`;
        return;
      }

      // MaxLength check
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `Must be no more than ${fieldRules.maxLength} characters`;
        return;
      }

      // Pattern check
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        if (field === 'password') {
          errors[field] = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character';
        } else {
          errors[field] = 'Invalid format';
        }
        return;
      }

      // Email check
      if (fieldRules.email && !EMAIL_REGEX.test(value)) {
        errors[field] = 'Invalid email address';
        return;
      }

      // URL check
      if (fieldRules.url && !URL_REGEX.test(value)) {
        errors[field] = 'Invalid URL';
        return;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      // Min value check
      if (fieldRules.min !== undefined && value < fieldRules.min) {
        errors[field] = `Must be at least ${fieldRules.min}`;
        return;
      }

      // Max value check
      if (fieldRules.max !== undefined && value > fieldRules.max) {
        errors[field] = `Must be no more than ${fieldRules.max}`;
        return;
      }
    }

    // Custom validation
    if (fieldRules.custom) {
      const result = fieldRules.custom(value);
      if (result === false) {
        errors[field] = 'Invalid value';
      } else if (typeof result === 'string') {
        errors[field] = result;
      }
    }
  });

  return errors;
};

// Helper function to check if form has errors
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { required: true, email: true },
  password: {
    required: true,
    minLength: 8,
    pattern: STRONG_PASSWORD_REGEX,
  },
  username: {
    required: true,
    minLength: 3,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  url: { required: true, url: true },
};

// Custom validation rule for checking login attempts
export const createLoginAttemptsRule = (username: string): ValidationRule => ({
  custom: () => {
    const attempts = getLoginAttempts(username);
    if (attempts.count >= 5 && Date.now() - attempts.lastAttempt < 15 * 60 * 1000) {
      return 'Account temporarily locked. Please try again in 15 minutes';
    }
    return true;
  },
});

// Custom validation rule creator
export const createCustomRule = (
  validator: (value: unknown) => boolean | string,
  message: string
): ValidationRule => ({
  custom: (value) => (validator(value) ? true : message),
});

// Async validation helper
export const validateAsync = async (
  values: Record<string, unknown>,
  rules: ValidationRules,
  asyncValidators: Record<string, (value: unknown) => Promise<boolean | string>>
): Promise<ValidationErrors> => {
  // First perform synchronous validation
  const errors = validate(values, rules);

  // Then perform async validation
  const asyncResults = await Promise.all(
    Object.entries(asyncValidators).map(async ([field, validator]) => {
      if (errors[field]) return null; // Skip if field already has error
      const result = await validator(values[field]);
      return result === true ? null : { field, error: result || 'Invalid value' };
    })
  );

  // Merge async validation results
  asyncResults.forEach((result) => {
    if (result) {
      errors[result.field] = result.error;
    }
  });

  return errors;
};