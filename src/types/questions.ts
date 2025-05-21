export interface QuestionOption {
  id: string;
  text: string;
  value: string;
  imageUrl?: string;
  imagePreview?: string;
  scale?: number;
  linkedSectionId?: string; // ID of the code section linked to this option
}

export interface Question {
  id: string;
  type: 'text' | 'choice' | 'boolean';
  text: string; // The question text presented to the user
  required: boolean;
  linkedSectionId?: string; // Default section if no option is chosen or for non-choice/boolean questions
  placeholderVariable?: string; // For 'text' type: the variable name in the linked section to replace
  options?: QuestionOption[]; // For 'choice' type
  validation?: { // For 'text' type
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}