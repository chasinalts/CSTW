import { motion, AnimatePresence } from 'framer-motion';

interface ValidationError {
  field: string;
  message: string;
}

interface FormValidationSummaryProps {
  errors: ValidationError[];
  onFieldFocus?: (field: string) => void;
}

const FormValidationSummary = ({ errors, onFieldFocus }: FormValidationSummaryProps) => {
  if (errors.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Please fix the following errors:
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <motion.li
                    key={`${error.field}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      type="button"
                      onClick={() => onFieldFocus?.(error.field)}
                      className="hover:underline focus:outline-none focus:underline"
                    >
                      {error.message}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FormValidationSummary;