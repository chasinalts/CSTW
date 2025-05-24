import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-8">
          <svg className="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-500 text-xl max-w-md mx-auto mb-8">
          Sorry, we couldn't find the page you're looking for. You may have mistyped the address or the page may have been moved.
        </p>
        <div className="space-x-4">
          <Link to="/">
            <Button variant="primary" size="lg">
              Return Home
            </Button>
          </Link>
          <Link to="/wizard">
            <Button variant="secondary" size="lg">
              Create Scanner
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;