import React from 'react';
import { motion } from 'framer-motion';
import HolographicText from './ui/HolographicText';
import Button from './ui/Button';

interface InitialUserChoiceProps {
  onChooseFullTemplate: () => void;
  onChooseWizard: () => void;
  fullTemplateAvailable: boolean;
}

const InitialUserChoice: React.FC<InitialUserChoiceProps> = ({
  onChooseFullTemplate,
  onChooseWizard,
  fullTemplateAvailable
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 futuristic-container"
    >
      <HolographicText
        text="Choose Your Template Creation Method"
        as="h2"
        variant="subtitle"
        className="text-2xl font-bold mb-6 text-center"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {fullTemplateAvailable ? (
          <div className="p-6 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
            <HolographicText
              text="Full Template"
              as="h3"
              variant="subtitle"
              className="text-xl font-semibold mb-4"
            />
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get the complete pre-defined template with all features included. Best for users who want a ready-to-use solution.
            </p>
            <Button 
              onClick={onChooseFullTemplate}
              className="mt-auto"
            >
              Use Full Template
            </Button>
          </div>
        ) : (
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center text-center opacity-60">
            <HolographicText
              text="Full Template"
              as="h3"
              variant="subtitle"
              className="text-xl font-semibold mb-4 text-gray-400"
            />
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              The administrator has not uploaded a full template yet. Please use the Template Builder Wizard instead.
            </p>
            <Button 
              disabled
              className="mt-auto opacity-50 cursor-not-allowed"
            >
              Not Available
            </Button>
          </div>
        )}
        
        <div className="p-6 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
          <HolographicText
            text="Template Builder Wizard"
            as="h3"
            variant="subtitle"
            className="text-xl font-semibold mb-4"
          />
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Build your template step-by-step by answering questions. Customize the template to your specific needs.
          </p>
          <Button 
            onClick={onChooseWizard}
            variant="primary"
            className="mt-auto"
          >
            Start Wizard
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InitialUserChoice;
