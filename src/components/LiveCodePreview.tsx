import React from 'react'; // Removed useMemo, useCallback as they are no longer used

interface LiveCodePreviewProps {
  codeToDisplay: string;
}

const LiveCodePreview: React.FC<LiveCodePreviewProps> = ({ codeToDisplay }) => {
  return (
    <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 futuristic-container"> {/* Added futuristic-container */}
      <div className="bg-gray-800/80 px-4 py-2 border-b border-cyan-400/30"> {/* Themed header */}
        <h3 className="text-lg font-medium text-cyan-300">Live Code Preview</h3>
      </div>
      <pre className="p-4 overflow-auto h-[calc(100%-41px)] bg-gray-900/80 text-sm text-gray-200 font-mono"> {/* Removed custom-scrollbar */}
        <code>{codeToDisplay || "// Your generated code will appear here..."}</code>
      </pre>
    </div>
  );
};

export default LiveCodePreview;