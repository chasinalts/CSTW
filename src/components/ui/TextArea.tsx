import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="form-field">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <textarea
        className={`w-full px-3 py-2 border rounded-md shadow-sm 
          focus:ring-blue-500 focus:border-blue-500 
          bg-white dark:bg-gray-800 
          text-gray-900 dark:text-white 
          border-gray-300 dark:border-gray-600
          ${className}`}
        {...props}
      />
    </div>
  );
};

export default TextArea;