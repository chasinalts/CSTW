// Simplified theme provider that always applies the futuristic theme
import { ReactNode, useEffect } from 'react';

// Simple ThemeProvider that just applies the futuristic theme
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Apply dark and futuristic theme classes
    document.documentElement.className = 'dark';
    document.body.classList.add('futuristic-theme');

    // Force background color
    document.body.style.backgroundColor = '#0f172a';
    document.documentElement.style.backgroundColor = '#0f172a';
  }, []);

  return <>{children}</>;
};

// No need for useTheme hook anymore since we always use futuristic theme
export const useTheme = () => ({ theme: 'futuristic' });