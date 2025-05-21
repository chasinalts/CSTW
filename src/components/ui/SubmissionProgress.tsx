import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

export interface SubmissionStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  message?: string;
}

interface SubmissionProgressProps {
  steps: SubmissionStep[];
  onClose?: () => void;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

const SubmissionProgress = ({ steps, onClose, showCloseButton = true, footer }: SubmissionProgressProps) => {
  const isComplete = steps.every(step => step.status === 'complete');
  const hasError = steps.some(step => step.status === 'error');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-x-0 bottom-0 pb-4 sm:pb-6"
    >
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {isComplete ? (
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : hasError ? (
                  <svg
                    className="h-6 w-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 w-0 flex-1">
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`flex-shrink-0 h-2 w-2 rounded-full ${
                          step.status === 'complete'
                            ? 'bg-green-500'
                            : step.status === 'error'
                            ? 'bg-red-500'
                            : step.status === 'processing'
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                      />
                      <div className="ml-3 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            step.status === 'complete'
                              ? 'text-green-700'
                              : step.status === 'error'
                              ? 'text-red-700'
                              : step.status === 'processing'
                              ? 'text-blue-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </p>
                        <AnimatePresence mode="wait">
                          {step.message && (
                            <motion.p
                              key={`${step.id}-message`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-1 text-sm text-gray-500"
                            >
                              {step.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {showCloseButton && onClose && (
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    type="button"
                    className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {footer && (
          <div className="mt-4 flex justify-end">
            {footer}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubmissionProgress;