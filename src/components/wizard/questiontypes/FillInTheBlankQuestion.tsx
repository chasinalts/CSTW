import React from 'react';
import { motion } from 'framer-motion';
import HolographicText from '../../ui/HolographicText'; // Adjust path
import LazyImage from '../../ui/LazyImage'; // Adjust path
import { TextField } from '../../ui/FormField'; // Adjust path
// import TooltipIcon from '../../ui/TooltipIcon'; // If available

export interface FillInTheBlankValidationRules {
  required?: boolean;
  min?: number; // For type="number"
  max?: number; // For type="number"
  pattern?: string; // For type="text"
  // Add other HTML5 validation attributes as needed
}

export interface FillInTheBlankConfigData {
  input_type?: 'text' | 'number' | 'password' | 'email' | 'tel'; // Common input types
  placeholder_text?: string;
  preview_image_url?: string; // Single primary preview image
  validation_rules?: FillInTheBlankValidationRules;
  // code_snippet_template is not directly used by this component for rendering
}

export interface FillInTheBlankQuestionProps {
  id: string;
  question_text: string;
  description?: string;
  tooltip_text?: string;
  current_answer?: string | number; // Current value
  onAnswer: (questionId: string, answer: string | number) => void;
  config_data: FillInTheBlankConfigData;
}

const FillInTheBlankQuestion: React.FC<FillInTheBlankQuestionProps> = ({
  id,
  question_text,
  description,
  tooltip_text,
  current_answer,
  onAnswer,
  config_data,
}) => {
  const {
    input_type = 'text',
    placeholder_text = 'Enter value...',
    preview_image_url,
    validation_rules = {},
  } = config_data;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onAnswer(id, input_type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value);
  };

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

      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
        {/* Input Field Area */}
        <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
          <TextField
            id={id}
            type={input_type}
            value={current_answer || ''}
            onChange={handleChange}
            placeholder={placeholder_text}
            required={validation_rules.required}
            min={validation_rules.min} // For type="number"
            max={validation_rules.max} // For type="number"
            pattern={validation_rules.pattern} // For type="text"
            // Use futuristic-input styling if TextField doesn't have it by default
            className="w-full futuristic-input" // Added futuristic-input
            // Add other validation props as needed from validation_rules
          />
          {/* Optionally display simple validation messages here if needed, though FormField might handle some */}
        </div>

        {/* Preview Image Area */}
        {preview_image_url && (
          <div className="w-full md:w-1/2 lg:w-2/3 aspect-video bg-gray-800/50 rounded-lg overflow-hidden futuristic-container p-1">
            <LazyImage
              src={preview_image_url}
              alt={`Preview for ${question_text}`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FillInTheBlankQuestion;
