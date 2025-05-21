import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  FormEvent
} from 'react';
import { validate, ValidationRules, ValidationErrors, hasErrors } from '../utils/validation';
import { useToast } from '../components/ui/Toast';

type FormErrors<T> = Partial<Record<keyof T, string>>;
type FormTouched<T> = Partial<Record<keyof T, boolean>>;

interface FormContextType<T extends Record<string, any>> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  submitForm: () => Promise<void>;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
}

const FormContext = createContext<FormContextType<any> | undefined>(undefined);

interface FormProviderProps<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: ValidationRules;
  onSubmit: (values: T) => Promise<void>;
  children: ReactNode;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  showToast?: boolean;
}

export function FormProvider<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  children,
  validateOnBlur = true,
  validateOnChange = false,
  showToast = true
}: FormProviderProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast: toast } = useToast();

  const validateField = useCallback(
    (field: keyof T) => {
      const fieldValidation = validate(
        { [field]: values[field] },
        { [field]: validationRules[field as string] }
      ) as ValidationErrors;
      
      const fieldError = fieldValidation[field as string];
      setErrors(prev => ({ ...prev, [field]: fieldError || '' }));
      return !fieldError;
    },
    [values, validationRules]
  );

  const validateForm = useCallback(() => {
    const formErrors = validate(values, validationRules) as ValidationErrors;
    setErrors(formErrors as FormErrors<T>);
    return !hasErrors(formErrors);
  }, [values, validationRules]);

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      if (validateOnChange) {
        validateField(field);
      }
    },
    [validateOnChange, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submitForm = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const isValid = validateForm();
      if (!isValid) {
        if (showToast) {
          toast('error', 'Please fix the form errors before submitting.');
        }
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
        if (showToast) {
          toast('success', 'Form submitted successfully!');
        }
        resetForm();
      } catch (error) {
        if (showToast) {
          toast('error', error instanceof Error ? error.message : 'An error occurred');
        }
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit, resetForm, showToast, toast]
  );

  const contextValue: FormContextType<T> = {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    submitForm,
    validateField,
    validateForm
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm<T extends Record<string, any>>() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context as FormContextType<T>;
}

export function useField<T extends Record<string, any>>(name: keyof T) {
  const { values, errors, touched, handleChange, handleBlur } = useForm<T>();
  
  return {
    field: {
      name,
      value: values[name],
      onChange: (e: any) => handleChange(name, e.target.value),
      onBlur: () => handleBlur(name)
    },
    meta: {
      error: errors[name],
      touched: touched[name]
    }
  };
}