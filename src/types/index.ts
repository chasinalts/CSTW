// Base Types
export interface BaseQuestion {
  id: string;
  type: 'text' | 'choice' | 'boolean';
  text: string;
  required: boolean;
  linkedSectionId?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  options: {
    id: string;
    text: string;
    value: string;
  }[];
  allowMultiple: boolean;
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  trueLabel: string;
  falseLabel: string;
}

export type Question = TextQuestion | ChoiceQuestion | BooleanQuestion;

// Section Types
export interface Section {
  id: string;
  title: string;
  code: string;
  isMandatory: boolean;
}

export interface StoredTemplate {
  templateStructure: {
    mode: 'sections' | 'full';
    sections: Section[];
    code: string;
  };
  baseTemplate: string; // compiled template
}

// Wizard State Types
export interface WizardProgress {
  step1Complete: boolean;
  step2Complete: boolean;
  step3Complete: boolean;
  step4Complete: boolean;
}

export interface WizardSettings {
  projectName: string;
  autoSave: boolean;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export interface WizardState {
  currentStep: number;
  formData: {
    baseCode: string;
    questions: Question[];
    settings: WizardSettings;
  };
  sections: Section[];
  progress: WizardProgress;
}

// Section Operations
export interface SectionOperations {
  addSection: () => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleRequired: (id: string) => void;
}

// File Operations
export interface FileOperations {
  supportedFormats: ['.txt', '.js', '.jsx'];
  maxFileSize: number;
  parseFile: (content: string) => Section[];
  exportTemplate: () => string;
}

// Mode Toggle
export interface ModeToggle {
  currentMode: 'sections' | 'full';
  onModeChange: (mode: 'sections' | 'full') => void;
  preserveContent: boolean;
}

// Preview Features
export interface PreviewFeatures {
  showSectionBoundaries: boolean;
  highlightMandatorySections: boolean;
  showQuestionLinks: boolean;
  allowTestInput: boolean;
}

// Validation Rules
export interface ValidationRules {
  requiredSections: boolean;
  questionCoverage: boolean;
  syntaxChecking: boolean;
  crossReferenceValidation: boolean;
}

// Storage Keys
export const STORAGE_KEYS = {
  TEMPLATE_STRUCTURE: 'templateStructure',
  BASE_TEMPLATE: 'baseTemplate',
  QUESTIONS: 'templateQuestions',
  WIZARD_STATE: 'wizardState',
  USER_SETTINGS: 'userSettings',
} as const;

// Wizard Actions
export type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PROGRESS'; payload: Partial<WizardProgress> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<WizardSettings> }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; updates: Partial<Question> } }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'REORDER_QUESTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'ADD_SECTION'; payload: Section }
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<Section> } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_BASE_CODE'; payload: string }
  | { type: 'RESET_STATE' };

// Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}