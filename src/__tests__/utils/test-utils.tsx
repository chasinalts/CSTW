// Test utilities for React components
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { vi } from 'vitest';

// Mock context providers
const MockAuthContext = React.createContext({
  currentUser: {
    id: 'user-123',
    email: 'test@example.com',
    is_owner: true,
  },
  isLoading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  isAuthenticated: true,
});

const MockThemeContext = React.createContext({
  theme: 'holographic',
  setTheme: vi.fn(),
});

// Custom render function that wraps components with necessary providers
function render(ui, options = {}) {
  const {
    currentUser = {
      id: 'user-123',
      email: 'test@example.com',
      is_owner: true,
    },
    isLoading = false,
    isAuthenticated = true,
    theme = 'holographic',
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return React.createElement(
      MockAuthContext.Provider,
      {
        value: {
          currentUser,
          isLoading,
          signIn: vi.fn(),
          signOut: vi.fn(),
          isAuthenticated,
        }
      },
      React.createElement(
        MockThemeContext.Provider,
        {
          value: {
            theme,
            setTheme: vi.fn(),
          }
        },
        children
      )
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method
export { render };
