import React from 'react';
import { motion } from 'framer-motion';
import HolographicText from '../../ui/HolographicText'; // Adjust path as needed
import LazyImage from '../../ui/LazyImage'; // Adjust path as needed
// import TooltipIcon from '../../ui/TooltipIcon'; // If a generic tooltip icon component exists

// Define the structure for the question's config_data specific to True/False
export interface TrueFalseConfigData {
  true_text?: string; // Optional custom text for "True" state
  false_text?: string; // Optional custom text for "False" state
  true_preview_image_url?: string;
  false_preview_image_url?: string;
  // Code snippets are not directly used by this component for rendering
}

// Define the props for the component
export interface TrueFalseQuestionProps {
  id: string;
  question_text: string;
  description?: string;
  tooltip_text?: string;
  current_answer?: boolean; // Current value (true/false)
  onAnswer: (questionId: string, answer: boolean) => void;
  config_data: TrueFalseConfigData;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  id,
  question_text,
  description,
  tooltip_text,
  current_answer,
  onAnswer,
  config_data,
}) => {
  const isChecked = current_answer === true;

  const handleToggle = () => {
    onAnswer(id, !isChecked);
  };

  const trueLabel = config_data.true_text || 'True';
  const falseLabel = config_data.false_text || 'False';
  const displayedImage = isChecked ? config_data.true_preview_image_url : config_data.false_preview_image_url;

  return (
    <motion.div 
      className="space-y-4 p-1" // Added p-1 to prevent content touching scanline of parent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center space-x-2">
        <HolographicText text={question_text} as="h3" variant="list-title" className="flex-grow" />
        {/* {tooltip_text && <TooltipIcon text={tooltip_text} />} */}
      </div>
      {description && <p className="text-sm text-gray-300">{description}</p>}

      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {/* Toggle Switch Area */}
        <div className="flex items-center space-x-3 p-3 futuristic-container rounded-lg min-w-[200px] justify-center">
          <span className={`text-sm font-medium ${!isChecked ? 'text-cyan-300' : 'text-gray-500'}`}>{falseLabel}</span>
          <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            onClick={handleToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
              isChecked ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                isChecked ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isChecked ? 'text-green-400' : 'text-gray-500'}`}>{trueLabel}</span>
        </div>

        {/* Preview Image Area */}
        {displayedImage && (
          <div className="w-full md:w-1/2 lg:w-2/3 aspect-video bg-gray-800/50 rounded-lg overflow-hidden futuristic-container p-1">
            <LazyImage
              src={displayedImage}
              alt={`Preview for ${isChecked ? trueLabel : falseLabel}`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrueFalseQuestion;
