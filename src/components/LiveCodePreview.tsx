import React from 'react';
import { useMemo, useCallback } from '../utils/react-imports';
import { useWizard } from '../contexts/WizardContext';
import type { Question, QuestionOption } from '../types/questions';
import type { Section } from '../hooks/useSections';
import { memoize } from '../utils/memoization';

interface LiveCodePreviewProps {
  skippedQuestions?: Set<string>;
  fullTemplateMode?: boolean;
  fullTemplateCode?: string;
}

const LiveCodePreview: React.FC<LiveCodePreviewProps> = ({
  skippedQuestions = new Set(),
  fullTemplateMode = false,
  fullTemplateCode = ''
}) => {
  const { state } = useWizard();
  const { answers, sections, questions } = state;

  // Memoized helper functions for code generation
  const getMandatorySections = useMemo(() =>
    memoize((sectionList: Section[]) => {
      return sectionList.filter(section => section.isMandatory);
    }),
    []
  );

  const findQuestionById = useMemo(() =>
    memoize((questionList: Question[], id: string) => {
      return questionList.find(q => q.id === id);
    }),
    []
  );

  const findSectionById = useMemo(() =>
    memoize((sectionList: Section[], id: string) => {
      return sectionList.find(s => s.id === id);
    }),
    []
  );

  const replacePlaceholders = useCallback((code: string, variable: string, value: string) => {
    const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g');
    return code.replace(regex, value);
  }, []);

  const generateMandatoryCode = useCallback((mandatorySections: Section[]) => {
    let code = '';
    const includedIds = new Set<string>();

    mandatorySections.forEach(section => {
      code += `// --- Section: ${section.title} (Mandatory) ---\n`;
      code += section.code + '\n\n';
      includedIds.add(section.id);
    });

    return { code, includedIds };
  }, []);

  const processAnswers = useCallback((
    answersObj: Record<string, unknown>,
    questionList: Question[],
    sectionList: Section[],
    includedIds: Set<string>,
    skippedQuestionIds: Set<string>
  ) => {
    let code = '';

    // Process answered questions
    Object.entries(answersObj).forEach(([questionId, answerValue]) => {
      const question = findQuestionById(questionList, questionId);
      if (!question) return;

      // Skip if this question is in the skipped list
      if (skippedQuestionIds.has(questionId)) return;

      let sectionIdToInclude: string | undefined;

      if (question.type === 'choice' && answerValue) {
        const selectedOptionIds = Array.isArray(answerValue) ? answerValue : [answerValue];
        selectedOptionIds.forEach(optionValue => {
          const selectedOption = question.options?.find((opt: QuestionOption) => opt.value === optionValue);
          if (selectedOption?.linkedSectionId) {
            sectionIdToInclude = selectedOption.linkedSectionId;
          }
        });
      } else if ((question.type === 'text' || question.type === 'boolean') && question.linkedSectionId) {
        sectionIdToInclude = question.linkedSectionId;
      }

      if (sectionIdToInclude && !includedIds.has(sectionIdToInclude)) {
        const section = findSectionById(sectionList, sectionIdToInclude);
        if (section) {
          let sectionCode = section.code;
          if (question.type === 'text' && question.placeholderVariable && typeof answerValue === 'string') {
            sectionCode = replacePlaceholders(sectionCode, question.placeholderVariable, answerValue);
          }
          code += `// --- Section: ${section.title} (Linked by: ${question.text.substring(0, 20)}...) ---\n`;
          code += sectionCode + '\n\n';
          includedIds.add(section.id);
        }
      } else if (question.type === 'text' && question.placeholderVariable && typeof answerValue === 'string' && !sectionIdToInclude) {
         code += `// User input for "${question.text.substring(0, 20)}...": ${answerValue}\n\n`;
      }
    });

    // Process skipped questions
    if (skippedQuestionIds.size > 0) {
      code += '// --- Skipped Questions ---\n';
      skippedQuestionIds.forEach(questionId => {
        const question = findQuestionById(questionList, questionId);
        if (question) {
          code += `// SKIPPED: ${question.text.substring(0, 50)}${question.text.length > 50 ? '...' : ''}\n`;

          // If the skipped question has a linked section, add a placeholder comment
          if (question.linkedSectionId) {
            const section = findSectionById(sectionList, question.linkedSectionId);
            if (section && !includedIds.has(section.id)) {
              code += `// Would have included section: ${section.title}\n`;
            }
          }
        }
      });
      code += '\n';
    }

    return code;
  }, [findQuestionById, findSectionById, replacePlaceholders]);

  const generatedCode = useMemo(() => {
    // If in full template mode, just return the full template code
    if (fullTemplateMode && fullTemplateCode) {
      return fullTemplateCode;
    }

    // Get mandatory sections
    const mandatorySections = getMandatorySections(sections);

    // Generate code for mandatory sections
    const { code: mandatoryCode, includedIds } = generateMandatoryCode(mandatorySections);

    // Process answers and add linked sections, including skipped questions
    const answersCode = processAnswers(answers, questions, sections, includedIds, skippedQuestions);

    // Combine the code
    const finalCode = mandatoryCode + answersCode;

    return finalCode.trim() || '// No code generated yet. Answer questions or mark sections as mandatory.';
  }, [
    fullTemplateMode,
    fullTemplateCode,
    answers,
    sections,
    questions,
    skippedQuestions,
    getMandatorySections,
    generateMandatoryCode,
    processAnswers
  ]);

  return (
    <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Code Preview</h3>
      </div>
      <pre className="p-4 overflow-auto h-[calc(100%-41px)] bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 font-mono">
        <code>{generatedCode}</code>
      </pre>
    </div>
  );
};

export default LiveCodePreview;