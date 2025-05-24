import React, { useEffect } from 'react';
import { useWizard, WizardQuestion, UserAnswer, SavedTemplate } from '../../contexts/WizardContext';
import QuestionDisplay from './QuestionDisplay';
import CodePreview from './CodePreview';
import NavigationControls from './NavigationControls';
import SavedTemplatesDisplay from './SavedTemplatesDisplay';

const Wizard: React.FC = () => {
  const {
    allQuestions,
    setAllQuestions,
    baseCode,
    setBaseCode,
    fullCode,
    setFullCode,
    savedTemplates,
    setSavedTemplates,
    isWizardActive,
    setIsWizardActive,
    setGeneratedCode,
    // userAnswers, // Add if directly used here
    // currentQuestionIndex, // Add if directly used here
  } = useWizard();

  // --- Initial Data Loading (mimicking original script's loadInitialData) ---
  useEffect(() => {
    try {
      const storedQuestions = localStorage.getItem('wizardQuestions');
      if (storedQuestions) setAllQuestions(JSON.parse(storedQuestions));
      else setAllQuestions([]); // Ensure it's an array if nothing is stored

      const storedBaseCode = localStorage.getItem('baseTemplateCode');
      setBaseCode(storedBaseCode || '// Base code not set by admin.\n');

      const storedFullCode = localStorage.getItem('fullTemplateCode');
      setFullCode(storedFullCode || '');

      const storedSavedTemplates = localStorage.getItem('userSavedTemplates');
      if (storedSavedTemplates) setSavedTemplates(JSON.parse(storedSavedTemplates));
      else setSavedTemplates([]); // Ensure it's an array

    } catch (error) {
      console.error("Error loading initial data from localStorage:", error);
      // Set defaults in case of parsing errors
      setAllQuestions([]);
      setBaseCode('// Base code not set by admin.\n');
      setFullCode('');
      setSavedTemplates([]);
    }
  }, [setAllQuestions, setBaseCode, setFullCode, setSavedTemplates]);

  const handleLoadFullTemplate = () => {
    if (fullCode) {
      setGeneratedCode(fullCode);
      setIsWizardActive(false); // Or a different state to show only preview
      alert('Full template loaded into preview.'); // Replace with a proper UI notification
    } else {
      alert('Full template is not available.'); // Replace with a proper UI notification
    }
  };

  const handleStartTemplateBuilder = () => {
    if (allQuestions.length === 0) {
      alert('No questions have been configured by the administrator yet.'); // Replace with UI notification
      return;
    }
    setIsWizardActive(true);
    // Reset answers and current question index if needed (managed in context or here)
    // setUserAnswers({});
    // setCurrentQuestionIndex(0);
    // updateCodePreview(); // This will be handled by effects in CodePreview or QuestionDisplay
  };

  return (
    <div className="wizard-container p-4 bg-gray-800 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Scanner Template Wizard</h1>

      {!isWizardActive ? (
        <div id="template-creation-method" className="text-center">
          <h2 className="text-2xl mb-4">Choose Template Creation Method</h2>
          <div id="full-template-option" className="mb-4 p-4 border border-gray-600 rounded-lg">
            <p className="mb-2">
              {fullCode ? 'Load a pre-configured full template.' : 'Full template is not available. Please use the Template Builder Wizard.'}
            </p>
            <button
              id="load-full-template-btn"
              onClick={handleLoadFullTemplate}
              disabled={!fullCode}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {fullCode ? 'Load Full Template' : 'Full Template Unavailable'}
            </button>
          </div>
          <div className="mb-4 p-4 border border-gray-600 rounded-lg">
            <p className="mb-2">Build a custom template step-by-step using the wizard.</p>
            <button
              id="start-template-builder-btn"
              onClick={handleStartTemplateBuilder}
              disabled={allQuestions.length === 0}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {allQuestions.length > 0 ? 'Start Template Builder Wizard' : 'Builder Unavailable (No Questions)'}
            </button>
          </div>
        </div>
      ) : (
        <div id="wizard-questions-area" className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow md:w-2/3">
            <QuestionDisplay />
            <NavigationControls />
          </div>
          <div className="md:w-1/3">
            <CodePreview />
          </div>
        </div>
      )}

      <SavedTemplatesDisplay />

      {/* Temporary display of fullCode for debugging */}
      {/* fullCode && !isWizardActive && (
        <div id="live-code-preview-window" className="mt-6 p-4 border border-gray-600 rounded-lg">
          <h3 className="text-xl mb-2">Full Template Preview</h3>
          <pre id="code-preview-content" className="bg-gray-900 p-3 rounded overflow-auto max-h-96">
            <code>{generatedCode || fullCode}</code>
          </pre>
        </div>
      )*/}
    </div>
  );
};

export default Wizard;