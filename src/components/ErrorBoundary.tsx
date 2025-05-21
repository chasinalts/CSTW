import { Component, ErrorInfo, ReactNode } from '../utils/react-imports';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Log to any monitoring service you might have
    try {
      // Report error to console in a structured way
      console.group('React Error Boundary Caught Error');
      console.error('Error:', error.message);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();

      // Update state with error info
      this.setState({
        errorInfo
      });
    } catch (loggingError) {
      console.error('Error logging failed:', loggingError);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6 border border-blue-500"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <svg
                    className="h-16 w-16 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-cyan-400 mb-4">
                  Oops! Something went wrong
                </h1>
                <div className="bg-gray-900 border-l-4 border-red-500 p-4 mb-6 text-left">
                  <p className="text-sm text-red-400 font-mono overflow-auto max-h-32">
                    {this.state.error?.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="text-xs text-gray-400 font-mono mt-2 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
                <div className="space-y-2 w-full">
                  <button
                    onClick={this.handleReload}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;