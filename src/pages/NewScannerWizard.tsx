import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import Button from '../components/ui/Button';
import HolographicText from '../components/ui/HolographicText';
import TrueFalseQuestion, { TrueFalseConfigData } from '../components/wizard/questiontypes/TrueFalseQuestion';
import MultipleChoiceQuestion, { MultipleChoiceConfigData, MultipleChoiceOption } from '../components/wizard/questiontypes/MultipleChoiceQuestion';
import FillInTheBlankQuestion, { FillInTheBlankConfigData } from '../components/wizard/questiontypes/FillInTheBlankQuestion';
import LiveCodePreview from '../components/LiveCodePreview';
import LiveFloatingPreview from '../components/LiveFloatingPreview';
// import { useToast } from '../components/ui/Toast'; // Optional: for toast notifications

interface MockQuestion {
  id: string;
  question_text: string;
  description?: string;
  question_type: 'true_false' | 'multiple_choice' | 'fill_in_blank';
  is_required?: boolean;
  config_data?: TrueFalseConfigData | MultipleChoiceConfigData | FillInTheBlankConfigData | any;
}

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 'q1',
    question_text: 'Enable Feature X (True/False)?',
    question_type: 'true_false',
    is_required: true,
    description: 'This enables the X feature, showing a green image when true and red when false.',
    config_data: {
      true_text: "Enabled",
      false_text: "Disabled",
      true_preview_image_url: 'https://placehold.co/600x300/4CAF50/FFFFFF?text=Feature+X+ON',
      false_preview_image_url: 'https://placehold.co/600x300/F44336/FFFFFF?text=Feature+X+OFF',
      true_code_snippet: "plotshape(true, title='Feature X ON', location=location.belowbar, color=color.green, size=size.tiny);\n",
      false_code_snippet: "// Feature X is OFF\n"
    }
  },
  {
    id: 'q2',
    question_text: 'Choose your visual style (Multiple Choice):',
    question_type: 'multiple_choice',
    is_required: true,
    description: 'Select one of the following visual styles for the indicator.',
    config_data: {
      allow_multiselect: false,
      options: [
        { id: 'style1', text: 'Cyberpunk Glow', preview_image_url: 'https://placehold.co/600x300/7c3aed/FFFFFF?text=Cyberpunk', code_snippet: "indicator('Style: Cyberpunk Glow', overlay=true, color=color.new(color.purple, 50))\n" },
        { id: 'style2', text: 'Minimalist Tech', preview_image_url: 'https://placehold.co/600x300/2563eb/FFFFFF?text=Minimalist', code_snippet: "indicator('Style: Minimalist Tech', overlay=true, color=color.new(color.blue, 50))\n" },
        { id: 'style3', text: 'Organic Dataflow', preview_image_url: 'https://placehold.co/600x300/16a34a/FFFFFF?text=Organic', code_snippet: "indicator('Style: Organic Dataflow', overlay=true, color=color.new(color.green, 50))\n" }
      ]
    }
  },
  {
    id: 'q3',
    question_text: 'Enter your RSI Length (Fill-in-the-Blank):',
    question_type: 'fill_in_blank',
    is_required: true,
    description: 'Specify the period for RSI calculation (e.g., 14).',
    config_data: {
      input_type: 'number',
      placeholder_text: '14',
      preview_image_url: 'https://placehold.co/600x300/4b5563/FFFFFF?text=RSI+Length',
      validation_rules: { required: true, min: 2, max: 100 },
      code_snippet_template: "rsiLength = input.int({{USER_INPUT}}, title='RSI Length', minval=1)\nplot(ta.rsi(close, rsiLength), title='RSI')\n"
    }
  },
  {
    id: 'q4',
    question_text: 'Activate Alert Conditions (True/False)?',
    question_type: 'true_false',
    is_required: false,
    description: 'Enable to include alertcondition calls in the script.',
    config_data: {
      true_text: "Active",
      false_text: "Inactive",
      true_code_snippet: "alertcondition(close > open, title='Green Candle Alert', message='A green candle has appeared!')\n",
      false_code_snippet: "// Alert conditions are Inactive\n"
    }
  },
];

interface WizardState {
  questions: MockQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
}

interface WizardContextType extends WizardState {
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  setAnswer: (questionId: string, answer: any) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useNewWizard = () => {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useNewWizard must be used within a NewWizardProvider');
  return context;
};

const NewScannerWizard: React.FC = () => {
  const [questions, setQuestions] = useState<MockQuestion[]>(MOCK_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showLivePreview, setShowLivePreview] = useState(true);
  // const { showToast } = useToast(); // Optional for toast feedback

  const setAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  useEffect(() => {
    let assembledCode = `// PineScript v6 (Default) - Generated by COMET Wizard
study("My COMET Scanner", overlay=false)

`;

    questions.forEach(q => {
      const answer = answers[q.id];
      let snippet = '';
      let questionComment = `// --- ${q.question_text.substring(0, 50)} ---\n`;

      if (answer === undefined && q.is_required) {
        questionComment += `// NOTE: This required question was not answered. Default or placeholder may be used if applicable.\n`;
      }

      switch (q.question_type) {
        case 'true_false':
          const tfConfig = q.config_data as TrueFalseConfigData;
          if (answer === true) {
            snippet = tfConfig?.true_code_snippet || '';
          } else {
            snippet = tfConfig?.false_code_snippet || (answer === undefined && q.is_required ? "// Required T/F question '"+ q.question_text.substring(0,20) +"...' skipped" : '');
          }
          break;
        case 'multiple_choice':
          const mcConfig = q.config_data as MultipleChoiceConfigData;
          if (answer && mcConfig?.options) {
            const selectedOption = mcConfig.options.find(opt => opt.id === answer);
            snippet = selectedOption?.code_snippet || '';
          } else if (answer === undefined && q.is_required) {
            snippet = "// Required Multiple Choice question '"+ q.question_text.substring(0,20) +"...' skipped";
          }
          break;
        case 'fill_in_blank':
          const fitbConfig = q.config_data as FillInTheBlankConfigData;
          if (answer !== undefined && String(answer).trim() !== '' && fitbConfig?.code_snippet_template) {
            snippet = fitbConfig.code_snippet_template.replace('{{USER_INPUT}}', String(answer));
          } else if ((answer === undefined || String(answer).trim() === '') && fitbConfig?.code_snippet_template) {
            const placeholder = fitbConfig.placeholder_text || 'DEFAULT_VALUE';
            snippet = (q.is_required ? "// Required Fill-in-the-blank '"+ q.question_text.substring(0,20) +"...' skipped. Using placeholder:\n" : "") +
                      fitbConfig.code_snippet_template.replace('{{USER_INPUT}}', placeholder);
          }
          break;
        default:
          snippet = `// Question type ${(q as any).question_type} - code generation not implemented yet.\n`;
      }

      if (snippet && snippet.trim() !== '') {
        assembledCode += questionComment + snippet + '\n\n';
      }
    });

    if (assembledCode.trim() === `// PineScript v6 (Default) - Generated by COMET Wizard
study("My COMET Scanner", overlay=false)`) {
      assembledCode += "// No options selected or no code snippets configured yet.\n";
    }

    setGeneratedCode(assembledCode);
  }, [answers, questions]);

  const currentQuestion = questions[currentQuestionIndex];

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleCopyGeneratedCode = async () => {
    if (!generatedCode) {
      alert('No code generated yet to copy.');
      // showToast('info', 'No code generated yet to copy.');
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedCode);
      alert('Generated code copied to clipboard!');
      // showToast('success', 'Generated code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy generated code: ', err);
      alert('Failed to copy code.');
      // showToast('error', 'Failed to copy code.');
    }
  };

  return (
    <WizardContext.Provider value={{ questions, currentQuestionIndex, answers, setCurrentQuestionIndex, setAnswer }}>
      <div className="min-h-screen futuristic-grid-bg text-white p-4 md:p-8 flex flex-col items-center">
        <HolographicText text="New COMET Scanner Wizard" as="h1" variant="title" className="mb-8 holographic-text-glitch" />

        <div className="w-full max-w-3xl mb-8 futuristic-container has-scanline p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2 text-sm text-cyan-300">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progressPercent)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-cyan-400 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="w-full max-w-3xl mb-8 p-6 futuristic-container has-scanline rounded-lg min-h-[300px]">
          {/* ... (question rendering logic remains the same) ... */}
          {currentQuestion ? (
            <>
              {currentQuestion.question_type === 'true_false' && (
                <TrueFalseQuestion
                  id={currentQuestion.id}
                  question_text={currentQuestion.question_text}
                  description={currentQuestion.description}
                  current_answer={answers[currentQuestion.id] as boolean | undefined}
                  onAnswer={setAnswer}
                  config_data={currentQuestion.config_data}
                />
              )}
              {currentQuestion.question_type === 'multiple_choice' && (
                <MultipleChoiceQuestion
                  id={currentQuestion.id}
                  question_text={currentQuestion.question_text}
                  description={currentQuestion.description}
                  current_answer={answers[currentQuestion.id] as string | undefined}
                  onAnswer={setAnswer}
                  config_data={currentQuestion.config_data}
                />
              )}
              {currentQuestion.question_type === 'fill_in_blank' && (
                <FillInTheBlankQuestion
                  id={currentQuestion.id}
                  question_text={currentQuestion.question_text}
                  description={currentQuestion.description}
                  current_answer={answers[currentQuestion.id] as string | number | undefined}
                  onAnswer={setAnswer}
                  config_data={currentQuestion.config_data}
                />
              )}
              {currentQuestion && !['true_false', 'multiple_choice', 'fill_in_blank'].includes(currentQuestion.question_type) && (
                <div>
                  <HolographicText text={currentQuestion.question_text} as="h2" variant="subtitle" className="mb-2" />
                  {currentQuestion.description && <p className="text-sm text-gray-300 mb-4">{currentQuestion.description}</p>}
                  <p className="text-center text-gray-500 py-8">(UI for '{currentQuestion.question_type}' question type will go here)</p>
                </div>
              )}
            </>
          ) : (
            <p>Loading questions or end of wizard.</p>
          )}
        </div>

        <div className="w-full max-w-3xl flex justify-between">
          <Button onClick={goToPrevious} disabled={currentQuestionIndex === 0} variant="secondary">
            Previous
          </Button>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={goToNext} className="btn-accent">
              Next
            </Button>
          ) : (
            <Button onClick={() => alert('Wizard Complete! See Live Preview for code.')} className="btn-accent">
              Finish
            </Button>
          )}
        </div>
        
        <div className="w-full max-w-3xl mt-4 flex justify-end items-center space-x-2"> {/* Added items-center and space-x-2 */}
          <Button onClick={handleCopyGeneratedCode} variant="secondary" size="sm" className=""> {/* Removed mr-2, using space-x-2 on parent */}
            Copy Generated Code
          </Button>
          <Button onClick={() => setShowLivePreview(prev => !prev)} variant="secondary" size="sm">
            {showLivePreview ? 'Hide' : 'Show'} Live Code Preview
          </Button>
        </div>

        {showLivePreview && (
          <LiveFloatingPreview 
            title="Generated PineScript" 
            onClose={() => setShowLivePreview(false)}
            defaultWidth={600} 
            defaultHeight={700}
          >
            <LiveCodePreview codeToDisplay={generatedCode} />
          </LiveFloatingPreview>
        )}
      </div>
    </WizardContext.Provider>
  );
};

export default NewScannerWizard;
