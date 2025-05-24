import React, { useCallback, useEffect } from 'react';
import { useWizard } from '../../contexts/WizardContext';

const CodePreview: React.FC = () => {
  const {
    baseCode,
    allQuestions,
    userAnswers,
    generatedCode,
    setGeneratedCode,
    fullCode, // For initial display if no wizard interaction yet
    isWizardActive // To determine if we should show generated or full code initially
  } = useWizard();

  const generateCode = useCallback(() => {
    if (!isWizardActive && fullCode) {
      // If wizard hasn't started and fullCode is available, show that.
      // This might be handled by Wizard.tsx setting generatedCode initially.
      // For now, let's assume generatedCode is the primary source of truth here.
      // If generatedCode is empty and fullCode exists, perhaps set it?
      // This depends on the desired initial state logic in Wizard.tsx
    }

    let currentGeneratedCode = baseCode;
    // Iterate through questions in their defined order to ensure correct code construction
    allQuestions.forEach(question => {
      const answer = userAnswers[question.id];
      if (answer && !answer.skipped) {
        if (answer.type === 'string' && answer.value) {
          // Replace placeholder with the string value
          // The placeholder format needs to be consistent, e.g., {{QUESTION_ID}} or {{PLACEHOLDER_NAME}}
          // Assuming question.details.placeholder is the key to replace
          const placeholder = question.details.placeholder || `{{${question.id}}}`;
          currentGeneratedCode = currentGeneratedCode.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(answer.value));
        } else if (answer.type === 'boolean' && answer.code) {
          // Append the specific code block for true/false
          currentGeneratedCode += `\n${answer.code}`;
        } else if (answer.type === 'multiple-choice' && answer.code) {
          // Append the specific code block for the chosen option
          currentGeneratedCode += `\n${answer.code}`;
        }
      }
    });
    setGeneratedCode(currentGeneratedCode);
  }, [baseCode, allQuestions, userAnswers, setGeneratedCode, isWizardActive, fullCode]);

  useEffect(() => {
    // Generate code whenever answers, questions, or baseCode change
    // Only run if the wizard is active, otherwise, it might overwrite fullCode preview
    if(isWizardActive){
        generateCode();
    }
  }, [userAnswers, allQuestions, baseCode, generateCode, isWizardActive]);

  // Effect to set initial code preview if wizard is not active and fullCode exists
  useEffect(() => {
    if (!isWizardActive && fullCode) {
      setGeneratedCode(fullCode);
    }
    // If wizard becomes active and generatedCode is still fullCode (or empty), regenerate based on answers
    else if (isWizardActive && (generatedCode === fullCode || generatedCode === '')) {
        generateCode();
    }
  }, [isWizardActive, fullCode, setGeneratedCode, generateCode, generatedCode]);


  return (
    <div id="live-code-preview-window" className="p-4 bg-gray-900 rounded-lg shadow-inner h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-200">Live Code Preview</h3>
        {/* Close button was in original HTML, but might not be needed if it's always visible */}
        {/* <button id="close-preview-btn" className="text-gray-400 hover:text-white">&times;</button> */}
      </div>
      <pre id="code-preview-content" className="flex-grow bg-black p-3 rounded overflow-auto text-sm text-green-400 font-mono">
        <code>
          {generatedCode || (isWizardActive ? '// Start answering questions to see code...' : '// Select an option or start the wizard to see code.')}
        </code>
      </pre>
    </div>
  );
};

export default CodePreview;