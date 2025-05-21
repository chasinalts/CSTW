// Wizard context that manages the state of the COMET Scanner Template Wizard, including user answers and progress
import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Question } from '../types/questions';
import type { Section } from '../hooks/useSections';

// Define the structure for storing answers
export type AnswerValue = string | string[] | boolean | undefined;
export type Answers = Record<string, AnswerValue>; // Question ID -> Answer Value

interface WizardState {
  currentStep: number; // Although we removed steps, keep for potential future use or structure
  progress: {
    step1Complete: boolean; // Keep for consistency, might represent overall completion
  };
  answers: Answers; // Store user answers here
  // We might not need sections/questions here if managed elsewhere, but keep if needed for context
  sections: Section[];
  questions: Question[];
}

type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PROGRESS'; payload: Partial<WizardState['progress']> }
  | { type: 'SET_ANSWER'; payload: { questionId: string; value: AnswerValue } }
  | { type: 'SET_ANSWERS'; payload: Answers } // Action to set all answers at once
  | { type: 'CLEAR_ANSWERS' } // Action to clear all answers
  | { type: 'SET_SECTIONS'; payload: Section[] } // Action to update sections
  | { type: 'SET_QUESTIONS'; payload: Question[] }; // Action to update questions

const initialState: WizardState = {
  currentStep: 1,
  progress: {
    step1Complete: false
  },
  answers: {},
  sections: [], // Initialize sections
  questions: [] // Initialize questions
};

const WizardContext = createContext<{
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
} | undefined>(undefined);

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: {
          ...state.progress,
          ...action.payload
        }
      };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.value
        }
      };
    case 'SET_ANSWERS':
      return {
        ...state,
        answers: action.payload
      };
    case 'CLEAR_ANSWERS':
      return {
        ...state,
        answers: {}
      };
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    default:
      return state;
  }
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // Potentially load sections/questions from hooks here if they are managed globally
  // const { sections } = useSections(); // Example
  // const { questions } = useQuestions(); // Example
  // useEffect(() => { dispatch({ type: 'SET_SECTIONS', payload: sections }); }, [sections]);
  // useEffect(() => { dispatch({ type: 'SET_QUESTIONS', payload: questions }); }, [questions]);

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}