// Component for displaying documentation from Context7 MCP Server
import React, { useState, useEffect } from 'react';
import useContext7 from '../../hooks/useContext7';

/**
 * Interface for Context7Documentation props
 */
interface Context7DocumentationProps {
  libraryId?: string;
  topic?: string;
  maxTokens?: number;
}

/**
 * Component for displaying documentation from Context7 MCP Server
 */
const Context7Documentation: React.FC<Context7DocumentationProps> = ({
  libraryId = 'auth0/docs',
  topic = 'react authentication',
  maxTokens = 5000
}) => {
  const { loading, error, documentation, getDocumentation } = useContext7();
  const [selectedLibrary, setSelectedLibrary] = useState<string>(libraryId);
  const [selectedTopic, setSelectedTopic] = useState<string>(topic);

  // Available libraries
  const libraries = [
    { id: 'auth0/docs', name: 'Auth0' },
    { id: 'supabase/supabase', name: 'Supabase' },
    { id: 'react/docs', name: 'React' },
    { id: 'tailwindcss/docs', name: 'Tailwind CSS' }
  ];

  // Available topics for each library
  const topics: Record<string, string[]> = {
    'auth0/docs': ['react authentication', 'user management', 'roles and permissions'],
    'supabase/supabase': ['javascript storage', 'authentication', 'database'],
    'react/docs': ['hooks', 'components', 'context'],
    'tailwindcss/docs': ['configuration', 'utilities', 'components']
  };

  // Fetch documentation when component mounts
  useEffect(() => {
    getDocumentation({
      libraryId: selectedLibrary,
      topic: selectedTopic,
      maxTokens
    });
  }, [getDocumentation, selectedLibrary, selectedTopic, maxTokens]);

  // Handle library change
  const handleLibraryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLibrary = e.target.value;
    setSelectedLibrary(newLibrary);
    // Reset topic to first one in the list
    setSelectedTopic(topics[newLibrary][0]);
  };

  // Handle topic change
  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    getDocumentation({
      libraryId: selectedLibrary,
      topic: selectedTopic,
      maxTokens
    });
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Context7 Documentation</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="library" className="block text-sm font-medium text-gray-300 mb-1">
            Library
          </label>
          <select
            id="library"
            value={selectedLibrary}
            onChange={handleLibraryChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {libraries.map((lib) => (
              <option key={lib.id} value={lib.id}>
                {lib.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">
            Topic
          </label>
          <select
            id="topic"
            value={selectedTopic}
            onChange={handleTopicChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {topics[selectedLibrary]?.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 text-white p-4 rounded-md mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-[600px]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : documentation ? (
          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-bold mb-2 text-blue-400">
              {documentation.title || 'Documentation'}
            </h3>
            <div dangerouslySetInnerHTML={{ __html: documentation.content || 'No content available' }} />
          </div>
        ) : (
          <p className="text-gray-400">No documentation available. Try selecting a different library or topic.</p>
        )}
      </div>
    </div>
  );
};

export default Context7Documentation;
