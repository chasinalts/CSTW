// Component to display a warning about third-party cookie restrictions
import React, { useState, useEffect } from 'react';

interface CookieWarningProps {
  className?: string;
}

const CookieWarning: React.FC<CookieWarningProps> = ({ className = '' }) => {
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    // Check if third-party cookies are likely to be blocked
    const checkCookieRestrictions = async () => {
      try {
        // Create a test cookie with SameSite=None; Secure
        document.cookie = "cookie_test=1; SameSite=None; Secure; path=/";
        
        // Wait a moment for the cookie to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if the cookie was set
        const hasCookie = document.cookie.includes('cookie_test=1');
        
        // If the cookie wasn't set, it might be due to third-party cookie restrictions
        setShowWarning(!hasCookie);
        
        // Clean up the test cookie
        document.cookie = "cookie_test=1; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (error) {
        console.error('Error checking cookie restrictions:', error);
        // If there was an error, show the warning just in case
        setShowWarning(true);
      }
    };
    
    checkCookieRestrictions();
  }, []);
  
  if (!showWarning) {
    return null;
  }
  
  return (
    <div className={`bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-800">
            <strong>Browser Cookie Restrictions:</strong> Your browser may be restricting third-party cookies, which could affect login functionality. 
            We use localStorage as a fallback, but you may need to allow cookies from cloud.appwrite.io for the best experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieWarning;
