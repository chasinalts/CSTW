import React from 'react';
import { useState, useEffect } from '../utils/react-imports';
import { useSupabase } from '../contexts/SupabaseContext';
import { QuestionService, Question } from '../services/questionService';
import QuestionModal from '../components/modals/QuestionModal';
import Button from '../components/ui/Button';

const AdminDashboardNew: React.FC = () => {
  const { supabase } = useSupabase();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const questionService = new QuestionService(supabase);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const questions = await questionService.getQuestions();
      setQuestions(questions);
      setError(null);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error('Error loading questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await questionService.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      setError('Failed to delete question. Please try again.');
      console.error('Error deleting question:', err);
    }
  };

  const handleSaveQuestion = async (questionData: Question) => {
    try {
      let updatedQuestion;
      if (editingQuestion) {
        updatedQuestion = await questionService.updateQuestion(editingQuestion.id, questionData);
        setQuestions(questions.map(q => q.id === editingQuestion.id ? updatedQuestion : q));
      } else {
        updatedQuestion = await questionService.createQuestion(questionData);
        setQuestions([...questions, updatedQuestion]);
      }
      setIsModalOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to save question. Please try again.');
      console.error('Error saving question:', err);
    }
  };

  const handleReorder = async (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newQuestions[currentIndex], newQuestions[targetIndex]] = 
    [newQuestions[targetIndex], newQuestions[currentIndex]];

    try {
      await questionService.reorderQuestions(newQuestions.map(q => q.id));
      setQuestions(newQuestions);
    } catch (err) {
      setError('Failed to reorder questions. Please try again.');
      console.error('Error reordering questions:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Scanner Questions</h1>
            <Button onClick={handleAddQuestion} variant="primary">
              Add Question
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-gray-50 rounded-lg p-6 flex items-center justify-between"
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {question.text}
                  </h3>
                  <p className="text-sm text-gray-500">Type: {question.type}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleReorder(question.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleReorder(question.id, 'down')}
                    disabled={index === questions.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEditQuestion(question)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
        initialData={editingQuestion || undefined}
      />
    </div>
  );
};

export default AdminDashboardNew;