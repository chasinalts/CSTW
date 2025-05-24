import React from 'react';
import { useWizard } from '../../contexts/WizardContext';

const NavigationControls: React.FC = () => {
  const {
    allQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    // setGeneratedCode, // For updateCodePreview
    // savedTemplates, // For saveProgress
    // setSavedTemplates, // For saveProgress
    // baseCode, // For updateCodePreview & finish
    // setIsWizardActive // For finish
  } = useWizard();

  const totalQuestions = allQuestions.length;

  // Placeholder for updateCodePreview logic
  const updateLocalCodePreview = () => {
    console.log("Updating code preview from navigation...");
    // const newCode = generateCodeFromAnswers(baseCode, allQuestions, userAnswers);
    // setGeneratedCode(newCode);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    if (currentQuestion) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: { ...prev[currentQuestion.id], skipped: true, type: currentQuestion.type },
      }));
      updateLocalCodePreview();
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        alert('This is the last question. Consider finishing.'); // Replace with UI notification
      }
    }
  };

  const handleSaveProgress = () => {
    // Logic from original saveProgressBtn
    // const templateName = prompt('Enter a name for this template:');
    // if (templateName) {
    //   const newSavedTemplate = {
    //     id: `template-${Date.now()}`,
    //     name: templateName,
    //     code: generatedCode, // This should be the current generated code
    //     timestamp: Date.now(),
    //   };
    //   const updatedTemplates = [...savedTemplates, newSavedTemplate];
    //   setSavedTemplates(updatedTemplates);
    //   localStorage.setItem('userSavedTemplates', JSON.stringify(updatedTemplates));
    //   alert('Progress saved!');
    //   // renderSavedTemplates(); // This will be handled by SavedTemplatesDisplay component reacting to context change
    // }
    alert('Save Progress functionality to be implemented.');
  };

  const handleFinishWizard = () => {
    // Logic from original finishWizardBtn
    // alert('Wizard finished! Your final code is in the preview.');
    // setIsWizardActive(false); // Or navigate to a summary page
    // The generatedCode in context should be the final code.
    alert('Finish Wizard functionality to be implemented.');
  };

  if (totalQuestions === 0) return null;

  return (
    <div className="navigation-controls mt-6 p-4 bg-gray-700 rounded-lg shadow-md flex flex-wrap justify-between items-center gap-3">
      <div className="flex gap-3">
        <button
          id="prev-question-btn"
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          id="next-question-btn"
          onClick={handleNext}
          disabled={currentQuestionIndex === totalQuestions - 1}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
        <button
          id="skip-question-btn"
          onClick={handleSkip}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
        >
          Skip
        </button>
      </div>

      <p id="question-indicator" className="text-sm text-gray-300">
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </p>

      <div className="flex gap-3">
        <button
          id="save-progress-btn"
          onClick={handleSaveProgress}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Progress
        </button>
        <button
          id="finish-wizard-btn"
          onClick={handleFinishWizard}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Finish & View Code
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;