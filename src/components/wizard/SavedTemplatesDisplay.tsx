import React from 'react';
import { useWizard, SavedTemplate } from '../../contexts/WizardContext';

const SavedTemplatesDisplay: React.FC = () => {
  const {
    savedTemplates,
    setSavedTemplates,
    setGeneratedCode,
    // setIsWizardActive, // Potentially to take user out of question flow when loading a template
  } = useWizard();

  const handleLoadTemplate = (template: SavedTemplate) => {
    setGeneratedCode(template.code);
    // setIsWizardActive(false); // Optional: exit wizard mode, show only preview
    alert(`Template "${template.name}" loaded into preview.`); // Replace with UI notification
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this saved template?')) {
      const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
      setSavedTemplates(updatedTemplates);
      localStorage.setItem('userSavedTemplates', JSON.stringify(updatedTemplates));
      alert('Template deleted.'); // Replace with UI notification
    }
  };

  if (savedTemplates.length === 0) {
    return (
      <div className="mt-8 p-4 bg-gray-700 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-center">Saved Templates</h3>
        <p className="text-center text-gray-400">No templates saved yet.</p>
      </div>
    );
  }

  return (
    <div id="templates-list-section" className="mt-8 p-4 bg-gray-700 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-3 text-center">Saved Templates</h3>
      <div id="templates-list" className="space-y-3">
        {savedTemplates.map(template => (
          <div key={template.id} className="p-3 bg-gray-600 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{template.name}</p>
              <p className="text-xs text-gray-400">Saved: {new Date(template.timestamp).toLocaleString()}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleLoadTemplate(template)}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
              >
                Load
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedTemplatesDisplay;