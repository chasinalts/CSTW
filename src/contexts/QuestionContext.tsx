import React from 'react';
import { createContext, useContext, useState } from '../utils/react-imports';
import type { ReactNode } from '../utils/react-imports';

interface Question {
  id: string;
  text: string;
  type: 'string' | 'boolean' | 'multiple-choice';
  details: {
    image?: {
      url: string;
      preview?: string;
    };
    placeholder?: string;
    booleanOptions?: {
      true: {
        text: string;
        code: string;
      };
      false: {
        text: string;
        code: string;
      };
    };
    multipleChoiceOptions?: Array<{
      id: string;
      text: string;
      code: string;
    }>;
  };
}

interface QuestionContextValue {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  answers: Record<string, any>;
  setAnswers: (answers: Record<string, any>) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  baseTemplate: string;
  setBaseTemplate: (template: string) => void;
  fullTemplate: string;
  setFullTemplate: (template: string) => void;
}

const QuestionContext = createContext<QuestionContextValue | null>(null);

export const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestionContext must be used within a QuestionProvider');
  }
  return context;
};

export const QuestionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [baseTemplate, setBaseTemplate] = useState('');
  const [fullTemplate, setFullTemplate] = useState('');

  return (
    <QuestionContext.Provider
      value={{
        questions,
        setQuestions,
        answers,
        setAnswers,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        baseTemplate,
        setBaseTemplate,
        fullTemplate,
        setFullTemplate
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export default QuestionProvider;