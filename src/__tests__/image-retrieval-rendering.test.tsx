import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/ui/Toast';
import Home from '../pages/Home';
import { mockSupabaseClient } from './mocks/supabaseMock';
import { mockAppwriteClient, mockAppwriteStorage, mockAppwriteDatabases } from './mocks/appwriteMock';

// Import the mocks from setupTests.ts
import '../setupTests';

// Mock components that might cause issues in tests
vi.mock('../components/ui/LazyImage', () => ({
  default: ({ src, alt, className, onClick }) => (
    <div data-testid="lazy-image-container">
      <img
        data-testid="lazy-image"
        src={src}
        alt={alt}
        className={className}
        onClick={onClick}
      />
    </div>
  ),
}));

vi.mock('../components/ui/HolographicText', () => ({
  default: ({ children }) => <div data-testid="holographic-text">{children}</div>,
}));

vi.mock('../components/ui/Button', () => ({
  default: ({ children, onClick }) => (
    <button data-testid="button" onClick={onClick}>{children}</button>
  ),
}));

// Mock the API calls
vi.mock('../utils/supabaseImageStorage', () => ({
  listFiles: vi.fn().mockImplementation(async (bucketType) => {
    if (bucketType === 'banner') {
      return mockSupabaseClient.from('images').select().filter('image_type', 'eq', 'banner').data;
    } else if (bucketType === 'gallery') {
      return mockSupabaseClient.from('images').select().filter('image_type', 'eq', 'gallery').data;
    } else if (bucketType === 'scanner') {
      return mockSupabaseClient.from('images').select().filter('image_type', 'eq', 'scanner').data;
    }
    return [];
  }),
  getFileUrl: vi.fn().mockImplementation((filePath, bucketType) => {
    return `https://example.com/${filePath}`;
  }),
  getFilePreview: vi.fn().mockImplementation(async (fileId, bucketType) => {
    return `https://example.com/preview/${fileId}.jpg`;
  }),
}));

vi.mock('../utils/databaseService', () => ({
  databaseService: {
    list: vi.fn().mockImplementation(async (collection, filters) => {
      if (collection === 'images') {
        const filterType = filters?.find(f => f.key === 'image_type')?.value;
        return mockSupabaseClient.from('images').select().filter('image_type', 'eq', filterType).data;
      } else if (collection === 'content') {
        return mockSupabaseClient.from('content').select().data;
      }
      return [];
    }),
    get: vi.fn().mockImplementation(async (collection, id) => {
      if (collection === 'content' && id === 'what_is_comet') {
        return {
          id: 'what_is_comet',
          content: 'COMET = Co-integrated Observational Market Evaluation Tool'
        };
      }
      return null;
    }),
  },
}));

// Mock user for AuthContext
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
  is_owner: true,
  permissions: {
    content_management: true,
    user_management: true,
    system_configuration: true,
    media_uploads: true,
    security_settings: true,
    site_customization: true,
  },
};

// Helper function to render with providers
const renderWithProviders = (ui, { currentUser = mockUser } = {}) => {
  return render(
    <AuthContext.Provider value={{
      currentUser,
      session: {},
      login: vi.fn(),
      signup: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    }}>
      <ThemeProvider>
        <ToastProvider>
          <MemoryRouter>{ui}</MemoryRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

describe('Image Retrieval and Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle banner image display', async () => {
    renderWithProviders(<Home />);

    // Wait for the component to render
    await waitFor(() => {
      // Either we have banner images or we have a "No banner uploaded yet" message
      const bannerImages = screen.queryAllByTestId('lazy-image');
      const noBannerMessage = screen.queryByText(/No banner uploaded yet/i);

      expect(bannerImages.length > 0 || noBannerMessage !== null).toBe(true);
    });
  });

  it('should handle gallery image display', async () => {
    renderWithProviders(<Home />);

    // Wait for the component to render
    await waitFor(() => {
      // Either we have gallery images or we have a "No gallery images" message
      const galleryImages = screen.queryAllByTestId('lazy-image');
      const noGalleryMessage = screen.queryByText(/No gallery images available/i);

      expect(galleryImages.length > 0 || noGalleryMessage !== null).toBe(true);
    });
  });

  it('should fetch and display COMET description', async () => {
    renderWithProviders(<Home />);

    // Wait for the COMET description to be displayed
    await waitFor(() => {
      expect(screen.getByText(/COMET = Co-integrated Observational Market Evaluation Tool/)).toBeInTheDocument();
    });
  });

  it('should handle error when fetching images', async () => {
    // Override the default handler to simulate an error
    server.use(
      http.get('/api/images', () => {
        return new HttpResponse(
          JSON.stringify({ error: 'Server error' }),
          { status: 500 }
        );
      })
    );

    renderWithProviders(<Home />);

    // Wait for the error message to be displayed
    await waitFor(() => {
      const errorElement = screen.getByText(/Failed to load images/i);
      expect(errorElement).toBeInTheDocument();
    });
  });

  it('should handle empty image list', async () => {
    // Override the default handler to return empty arrays
    server.use(
      http.get('/api/images', () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Home />);

    // Wait for the empty state message to be displayed
    await waitFor(() => {
      const emptyElement = screen.getByText(/No gallery images available/i);
      expect(emptyElement).toBeInTheDocument();
    });
  });

  it('should display template wizard button for all users', async () => {
    // Even unauthenticated users should see the button
    renderWithProviders(<Home />, { currentUser: null });

    // Wait for the component to render
    await waitFor(() => {
      const wizardButton = screen.getByText(/Start the COMET Scanner Template Wizard/i);
      expect(wizardButton).toBeInTheDocument();
    });
  });
});
