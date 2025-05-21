import { useState, useEffect } from '../utils/react-imports';
import type { Question, QuestionOption } from '../types/questions.ts';
import { cleanupImageUrl } from '../utils/imageHandlers';

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const savedQuestions = localStorage.getItem('admin_questions');
    return savedQuestions ? JSON.parse(savedQuestions) : [];
  });

  useEffect(() => {
    localStorage.setItem('admin_questions', JSON.stringify(questions));
  }, [questions]);

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      questions.forEach((question: Question) => {
        question.options?.forEach((option: QuestionOption) => {
          if (option.imagePreview) {
            cleanupImageUrl(option.imagePreview);
          }
        });
      });
    };
  }, [questions]);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type,
      text: '',
      required: false,
      ...(type === 'choice' && { options: [] }),
      ...(type === 'text' && { placeholderVariable: '' })
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion
  };
};

export default useQuestions;