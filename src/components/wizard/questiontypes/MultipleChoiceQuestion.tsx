import React from 'react';
import { motion } from 'framer-motion';
import HolographicText from '../../ui/HolographicText'; // Adjust path
import LazyImage from '../../ui/LazyImage'; // Adjust path
// import TooltipIcon from '../../ui/TooltipIcon'; // If available

export interface MultipleChoiceOption {
  id: string; // Unique ID for the option
  text: string;
  preview_image_url?: string;
  // code_snippet is not directly used by this component for rendering
}

export interface MultipleChoiceConfigData {
  options: MultipleChoiceOption[];
  allow_multiselect?: boolean; // Will be false for Phase A
}

export interface MultipleChoiceQuestionProps {
  id: string;
  question_text: string;
  description?: string;
  tooltip_text?: string;
  current_answer?: string; // Stores the ID of the selected option
  onAnswer: (questionId: string, answer: string) => void; // answer is the selected option's id
  config_data: MultipleChoiceConfigData;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  id,
  question_text,
  description,
  tooltip_text,
  current_answer,
  onAnswer,
  config_data,
}) => {
  const { options = [] } = config_data;

  return (
    <motion.div
      className="space-y-4 p-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center space-x-2">
        <HolographicText text={question_text} as="h3" variant="list-title" className="flex-grow" />
        {/* {tooltip_text && <TooltipIcon text={tooltip_text} />} */}
      </div>
      {description && <p className="text-sm text-gray-300 mb-4">{description}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const isSelected = current_answer === option.id;
          return (
            <motion.div
              key={option.id}
              onClick={() => onAnswer(id, option.id)}
              className={`p-0.5 rounded-lg cursor-pointer transition-all duration-200 ease-in-out futuristic-container ${
                isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-800 scale-105' : 'hover:scale-105'
              }`}
              whileHover={{ scale: isSelected ? 1.05 : 1.02, transition: { duration: 0.15 } }} // Slight hover if not selected
              whileTap={{ scale: 0.98 }}
            >
              <div className={`p-4 rounded-md h-full flex flex-col items-center text-center space-y-3 ${isSelected ? 'bg-cyan-700/20' : 'bg-gray-800/70'}`}>
                {option.preview_image_url && (
                  <div className="w-full aspect-video bg-gray-700/50 rounded overflow-hidden mb-2">
                    <LazyImage
                      src={option.preview_image_url}
                      alt={`Preview for ${option.text}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <HolographicText text={option.text} as="p" variant="text" className={`font-medium ${isSelected ? 'text-cyan-300' : 'text-gray-200'}`} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MultipleChoiceQuestion;
