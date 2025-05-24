import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0Context } from '../contexts/Auth0Context';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  const { isAuthenticated, currentUser, login } = useAuth0Context();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">COMET Scanner Builder</h1>
            {isAuthenticated ? (
              <div className="space-x-4">
                <Link to="/wizard">
                  <Button variant="primary">Create Scanner</Button>
                </Link>
                {currentUser?.is_admin && (
                  <Link to="/admin">
                    <Button variant="secondary">Admin</Button>
                  </Link>
                )}
              </div>
            ) : (
              <Button onClick={() => login()}>Login</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Build Your Perfect Scanner
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create custom TradingView scanners with powerful features like multi-timeframe analysis, edge case detection, and advanced signal processing.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {!isAuthenticated ? (
              <Button onClick={() => login()} size="lg">
                Get Started
              </Button>
            ) : (
              <Link to="/wizard">
                <Button variant="primary" size="lg">
                  Create New Scanner
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-24">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Why use COMET Scanner Builder?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900">Quick Setup</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Create a scanner in minutes using our intuitive wizard interface. No coding required.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900">Customizable</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Tailor every aspect of your scanner to match your trading strategy and preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900">Advanced Features</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Get access to unique COMET features like edge case detection and pattern recognition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;