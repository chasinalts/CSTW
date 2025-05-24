import React from 'react';
import { useWizard, WizardQuestion } from '../../contexts/WizardContext';

const QuestionDisplay: React.FC = () => {
  const {
    allQuestions,
    currentQuestionIndex,
    userAnswers,
    setUserAnswers,
    // setGeneratedCode, // Will be needed for updateCodePreview logic
  } = useWizard();

  if (allQuestions.length === 0 || currentQuestionIndex < 0 || currentQuestionIndex >= allQuestions.length) {
    return <p className="text-center text-gray-400">No question to display or index out of bounds.</p>;
  }

  const question = allQuestions[currentQuestionIndex];
  const currentAnswer = userAnswers[question.id];

  // Placeholder for updateCodePreview - this logic will be more complex
  // and likely involve calling a service or utility function.
  const updateLocalCodePreview = () => {
    // This function will need to be fleshed out based on how code generation is handled.
    // For now, it's a placeholder.
    console.log("Updating code preview based on answers...");
    // const newCode = generateCodeFromAnswers(baseCode, allQuestions, userAnswers);
    // setGeneratedCode(newCode);
  };

  const handleInputChange = (value: any) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [question.id]: { value, type: question.type, placeholder: question.details.placeholder },
    }));
    updateLocalCodePreview();
  };

  const handleBooleanChoice = (value: boolean) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [question.id]: { value, type: 'boolean', code: value ? question.details.trueCode : question.details.falseCode },
    }));
    updateLocalCodePreview();
  };

  const handleMultipleChoice = (optionText: string, optionCode: string) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [question.id]: { value: optionText, type: 'multiple-choice', code: optionCode },
    }));
    updateLocalCodePreview();
  };

  return (
    <div className="question-display p-6 bg-gray-700 rounded-lg shadow-md">
      <h3 className="question-title text-xl font-semibold mb-3">
        {`Q${currentQuestionIndex + 1}: ${question.text}`}
      </h3>

      {question.details.image && question.type !== 'boolean' && (
        <img
          src={question.details.image}
          alt={`Helper image for ${question.text}`}
          className="question-image mb-4 rounded max-w-xs mx-auto"
        />
      )}

      <div className="options space-y-3">
        {question.type === 'string' && (
          <input
            type="text"
            placeholder={question.details.placeholder || 'Your answer...'}
            value={currentAnswer?.value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
          />
        )}

        {question.type === 'boolean' && (
          <div className="flex gap-3">
            {[true, false].map(val => {
              const text = val ? (question.details.trueText || 'True') : (question.details.falseText || 'False');
              const image = val ? question.details.trueImage : question.details.falseImage;
              return (
                <button
                  key={String(val)}
                  onClick={() => handleBooleanChoice(val)}
                  className={`flex-1 p-2 rounded border transition-colors duration-150 ease-in-out 
                              ${currentAnswer?.value === val ? 'bg-blue-600 border-blue-500' : 'bg-gray-600 border-gray-500 hover:bg-gray-500'}`}
                >
                  {image && <img src={image} alt={text} className="inline-block h-6 w-6 mr-2 rounded-sm" />}
                  {text}
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'multiple-choice' && question.details.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.details.options.map((opt: { text: string; code: string; image?: string }, index: number) => (
              <button
                key={index}
                onClick={() => handleMultipleChoice(opt.text, opt.code)}
                className={`p-2 rounded border text-left transition-colors duration-150 ease-in-out 
                            ${currentAnswer?.value === opt.text ? 'bg-blue-600 border-blue-500' : 'bg-gray-600 border-gray-500 hover:bg-gray-500'}`}
              >
                {opt.image && <img src={opt.image} alt={opt.text} className="inline-block h-8 w-8 mr-2 rounded-sm object-contain" />}
                {opt.text}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Indicator can be part of NavigationControls or Wizard main component */}
      {/* <p id="question-indicator" className="mt-4 text-sm text-gray-400">
        {`Question ${currentQuestionIndex + 1} of ${allQuestions.length}`}
      </p> */}
    </div>
  );
};

export default QuestionDisplay;