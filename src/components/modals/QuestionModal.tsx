import React from 'react';
import { useState, type ChangeEvent } from '../../utils/react-imports';
import Modal from '../ui/Modal';
import { TextField } from '../ui/FormField';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Question) => void;
  initialData?: Question;
}

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
        image?: {
          url: string;
          preview?: string;
        };
      };
      false: {
        text: string;
        code: string;
        image?: {
          url: string;
          preview?: string;
        };
      };
    };
    multipleChoiceOptions?: Array<{
      id: string;
      text: string;
      code: string;
      image?: {
        url: string;
        preview?: string;
      };
    }>;
  };
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [questionData, setQuestionData] = useState<Question>(
    initialData || {
      id: String(Date.now()),
      text: '',
      type: 'string',
      details: {}
    }
  );

  const [questionType, setQuestionType] = useState(questionData.type);

  const handleSave = () => {
    onSave(questionData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={initialData ? 'Edit Question' : 'Add New Question'}
      size="xl"
    >
      <div className="space-y-6">
        <TextField
          label="Question Text"
          value={questionData.text}
          onChange={(e) => setQuestionData({ ...questionData, text: e.target.value })}
          placeholder="e.g., What is your preferred indicator?"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => {
              setQuestionType(e.target.value as Question['type']);
              setQuestionData({
                ...questionData,
                type: e.target.value as Question['type'],
                details: {}
              });
            }}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="string">String (Placeholder)</option>
            <option value="boolean">Boolean (True/False)</option>
            <option value="multiple-choice">Multiple Choice</option>
          </select>
        </div>

        {/* Type-specific fields */}
        {questionType === 'string' && (
          <div>
            <TextField
              label="Placeholder in code (e.g., {{USER_INPUT}})"
              value={questionData.details.placeholder || ''}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  details: { ...questionData.details, placeholder: e.target.value }
                })
              }
              placeholder="{{USER_INPUT}}"
            />
          </div>
        )}

        {questionType === 'boolean' && (
          <div className="space-y-6">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-4">True Option</h3>
              <TextField
                label="Button Text"
                value={questionData.details.booleanOptions?.true?.text || ''}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    details: {
                      ...questionData.details,
                      booleanOptions: {
                        ...questionData.details.booleanOptions,
                        true: {
                          ...questionData.details.booleanOptions?.true,
                          text: e.target.value
                        }
                      }
                    }
                  })
                }
              />
              <TextArea
                label="Code Snippet"
                value={questionData.details.booleanOptions?.true?.code || ''}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    details: {
                      ...questionData.details,
                      booleanOptions: {
                        ...questionData.details.booleanOptions,
                        true: {
                          ...questionData.details.booleanOptions?.true,
                          code: e.target.value
                        }
                      }
                    }
                  })
                }
                rows={3}
              />
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-4">False Option</h3>
              <TextField
                label="Button Text"
                value={questionData.details.booleanOptions?.false?.text || ''}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    details: {
                      ...questionData.details,
                      booleanOptions: {
                        ...questionData.details.booleanOptions,
                        false: {
                          ...questionData.details.booleanOptions?.false,
                          text: e.target.value
                        }
                      }
                    }
                  })
                }
              />
              <TextArea
                label="Code Snippet"
                value={questionData.details.booleanOptions?.false?.code || ''}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    details: {
                      ...questionData.details,
                      booleanOptions: {
                        ...questionData.details.booleanOptions,
                        false: {
                          ...questionData.details.booleanOptions?.false,
                          code: e.target.value
                        }
                      }
                    }
                  })
                }
                rows={3}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSave}>Save Question</Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuestionModal;