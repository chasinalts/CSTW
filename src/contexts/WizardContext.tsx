import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the shape of a question
export interface WizardQuestion {
  id: string;
  text: string;
  type: 'string' | 'boolean' | 'multiple-choice';
  details: any; // Can be more specific based on question type
  // Example for string:
  // details: { placeholder?: string; }
  // Example for boolean:
  // details: { trueText?: string; falseText?: string; trueCode?: string; falseCode?: string; trueImage?: string; falseImage?: string; }
  // Example for multiple-choice:
  // details: { options: Array<{ text: string; code: string; image?: string; }> }
}

// Define the shape of a user answer
export interface UserAnswer {
  value?: any;
  skipped?: boolean;
  type: WizardQuestion['type'];
  placeholder?: string; // For string type
  code?: string; // For boolean/multiple-choice type
}

export interface UserAnswers {
  [questionId: string]: UserAnswer;
}

export interface SavedTemplate {
  id: string;
  name: string;
  code: string;
  timestamp: number;
}

// Define the shape of the context state
interface WizardContextState {
  allQuestions: WizardQuestion[];
  setAllQuestions: Dispatch<SetStateAction<WizardQuestion[]>>;
  userAnswers: UserAnswers;
  setUserAnswers: Dispatch<SetStateAction<UserAnswers>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  baseCode: string;
  setBaseCode: Dispatch<SetStateAction<string>>;
  fullCode: string;
  setFullCode: Dispatch<SetStateAction<string>>;
  savedTemplates: SavedTemplate[];
  setSavedTemplates: Dispatch<SetStateAction<SavedTemplate[]>>;
  isWizardActive: boolean;
  setIsWizardActive: Dispatch<SetStateAction<boolean>>; // To control visibility of wizard vs. choice
  generatedCode: string; // Stores the dynamically generated code
  setGeneratedCode: Dispatch<SetStateAction<string>>;
}

// Create the context with a default undefined value
const WizardContext = createContext<WizardContextState | undefined>(undefined);

// Create a provider component
interface WizardProviderProps {
  children: ReactNode;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const [allQuestions, setAllQuestions] = useState<WizardQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [baseCode, setBaseCode] = useState<string>('');
  const [fullCode, setFullCode] = useState<string>('');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  // Load initial data from localStorage (example)
  // useEffect(() => {
  //   const storedQuestions = localStorage.getItem('wizardQuestions');
  //   if (storedQuestions) setAllQuestions(JSON.parse(storedQuestions));
  //   const storedBaseCode = localStorage.getItem('baseTemplateCode');
  //   if (storedBaseCode) setBaseCode(storedBaseCode);
  //   // ... load other items
  // }, []);

  return (
    <WizardContext.Provider value={{
      allQuestions, setAllQuestions,
      userAnswers, setUserAnswers,
      currentQuestionIndex, setCurrentQuestionIndex,
      baseCode, setBaseCode,
      fullCode, setFullCode,
      savedTemplates, setSavedTemplates,
      isWizardActive, setIsWizardActive,
      generatedCode, setGeneratedCode
    }}>
      {children}
    </WizardContext.Provider>
  );
};

// Create a custom hook to use the WizardContext
export const useWizard = (): WizardContextState => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};