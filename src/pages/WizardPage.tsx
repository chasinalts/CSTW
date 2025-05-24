import React from 'react';
import { useState, useEffect } from '../utils/react-imports';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { QuestionService, Question } from '../services/questionService';
import { createCodeGeneratorService } from '../services/codeGeneratorService';
import { ScannerService } from '../services/scannerService';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import { TextField } from '../components/ui/FormField';

const WizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scannerName, setScannerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const questionService = new QuestionService(supabase);
  const scannerService = new ScannerService(supabase);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const loadedQuestions = await questionService.getQuestions();
      setQuestions(loadedQuestions);
      setError(null);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error('Error loading questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].id]: answer
    }));
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateCode();
    }
  };

  const generateCode = () => {
    const codeGenerator = createCodeGeneratorService(questions);
    const result = codeGenerator.generateCode(answers, scannerName || 'My Scanner');
    setGeneratedCode(result.code);
  };

  const handleSaveScanner = async () => {
    if (!scannerName) {
      setError('Please provide a name for your scanner');
      return;
    }

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User not authenticated');

      await scannerService.saveScanner({
        name: scannerName,
        description: `Scanner generated on ${new Date().toLocaleDateString()}`,
        code: generatedCode,
        answers,
        is_public: false,
        user_id: user.id
      });

      setError(null);
      navigate('/scanners'); // Navigate to scanner list after saving
    } catch (err) {
      setError('Failed to save scanner. Please try again.');
      console.error('Error saving scanner:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ... rest of the component remains the same ...
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
          <p className="text-gray-600">Please contact an administrator to set up the scanner wizard.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          {!generatedCode ? (
            <>
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Question {currentStep + 1} of {questions.length}</span>
                  <span>{Math.round(((currentStep) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.text}</h2>

                {currentQuestion.type === 'string' && (
                  <TextField
                    value={answers[currentQuestion.id] || ''}
                    onChange={e => handleAnswer(e.target.value)}
                    placeholder={currentQuestion.details.placeholder}
                  />
                )}

                {currentQuestion.type === 'boolean' && currentQuestion.details.booleanOptions && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleAnswer(true)}
                      variant="secondary"
                      className="text-left"
                    >
                      {currentQuestion.details.booleanOptions.true.text}
                    </Button>
                    <Button
                      onClick={() => handleAnswer(false)}
                      variant="secondary"
                      className="text-left"
                    >
                      {currentQuestion.details.booleanOptions.false.text}
                    </Button>
                  </div>
                )}

                {currentQuestion.type === 'multiple-choice' && 
                  currentQuestion.details.multipleChoiceOptions && (
                  <div className="grid gap-3">
                    {currentQuestion.details.multipleChoiceOptions.map(option => (
                      <Button
                        key={option.id}
                        onClick={() => handleAnswer(option.id)}
                        variant="secondary"
                        className="text-left"
                      >
                        {option.text}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Scanner is Ready!</h2>
              
              <div className="mb-6">
                <TextField
                  label="Scanner Name"
                  value={scannerName}
                  onChange={e => setScannerName(e.target.value)}
                  placeholder="Enter a name for your scanner"
                />
              </div>

              <TextArea
                label="Generated Code"
                value={generatedCode}
                rows={15}
                readOnly
              />

              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setGeneratedCode('');
                    setCurrentStep(0);
                    setAnswers({});
                  }}
                >
                  Start Over
                </Button>
                <Button
                  onClick={handleSaveScanner}
                  isLoading={isSaving}
                >
                  Save Scanner
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardPage;