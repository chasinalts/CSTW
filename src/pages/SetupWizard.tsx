import { motion } from 'framer-motion';
// import { useWizard } from '../contexts/WizardContext'; // Unused import
import StepOne from './wizard/StepOne';

const pageTransition = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 }
};

const SetupWizard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <motion.div
        key="content"
        {...pageTransition}
      >
        <StepOne />
      </motion.div>
    </div>
  );
};

export default SetupWizard;