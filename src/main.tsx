import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/holographic.css'; // Import holographic styles directly
import ErrorBoundary from './components/ErrorBoundary';

import analytics from './utils/analytics';
import loggingService from './utils/loggingService';
import { loadEnvVars } from './utils/loadEnvVars';

// Make sure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.warn('Root element not found, created a new one');
}

// Initialize the application
async function initApp() {
  // Load environment variables
  await loadEnvVars();

  // Render the app
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-900">
          <App />
        </div>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Initialize performance analytics only in browser environment
  if (typeof window !== 'undefined') {
    // Initialize analytics
    analytics.init();

    // Initialize logging service
    loggingService.initialize();
    console.log('Logging service initialized');
  }
}

// Start the application
initApp().catch(error => {
  console.error('Failed to initialize the application:', error);

  // Render a fallback UI in case of initialization failure
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold mb-4">Application Error</h1>
        <p className="mb-4">There was a problem loading the application. Please try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    </div>
  );
});
