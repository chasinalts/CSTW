import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Home from '../../pages/Home';

// Mock the supabaseImageStorage module
vi.mock('../../utils/supabaseImageStorage', () => ({
  listFiles: vi.fn().mockImplementation((bucketType) => {
    if (bucketType === 'banner') {
      return Promise.resolve([
        { id: 'banner-1', url: 'https://example.com/banner/image1.jpg' }
      ]);
    } else if (bucketType === 'gallery') {
      return Promise.resolve([
        { id: 'gallery-1', url: 'https://example.com/gallery/image1.jpg' },
        { id: 'gallery-2', url: 'https://example.com/gallery/image2.jpg' }
      ]);
    }
    return Promise.resolve([]);
  }),
  getFileUrl: vi.fn().mockImplementation((fileId) => {
    return Promise.resolve(`https://example.com/${fileId}`);
  })
}));

// Mock the databaseService module
vi.mock('../../utils/databaseService', () => ({
  databaseService: {
    list: vi.fn().mockImplementation((collection, filters) => {
      if (collection === 'content' && filters && filters[0]?.value === 'what_is_comet') {
        return Promise.resolve([
          { id: 'comet-desc', content: 'Test COMET description', type: 'what_is_comet' }
        ]);
      }
      return Promise.resolve([]);
    }),
    get: vi.fn().mockImplementation((collection, id) => {
      if (collection === 'content' && id === 'comet-desc') {
        return Promise.resolve({ id: 'comet-desc', content: 'Test COMET description', type: 'what_is_comet' });
      }
      return Promise.resolve(null);
    })
  }
}));

// Note: We already have a mock for supabaseImageStorage above,
// but we need to update it to match the expected format
vi.mock('../../utils/supabaseImageStorage', () => ({
  listFiles: vi.fn().mockImplementation((bucketType) => {
    if (bucketType === 'banner') {
      return Promise.resolve([
        { id: 'banner-1', publicUrl: 'https://example.com/banner/image1.jpg', image_type: 'banner' },
      ]);
    } else if (bucketType === 'gallery') {
      return Promise.resolve([
        { id: 'gallery-1', publicUrl: 'https://example.com/gallery/image1.jpg', image_type: 'gallery' },
        { id: 'gallery-2', publicUrl: 'https://example.com/gallery/image2.jpg', image_type: 'gallery' },
      ]);
    }
    return Promise.resolve([]);
  }),
  getFileUrl: vi.fn().mockImplementation((fileId) => {
    return Promise.resolve(`https://example.com/${fileId}`);
  }),
  getFilePreview: vi.fn().mockImplementation((fileId) => {
    return Promise.resolve(`https://example.com/preview/${fileId}`);
  }),
  deleteFile: vi.fn().mockResolvedValue(true)
}));

// Note: We already have a mock for databaseService above,
// but we need to update it to match the expected format
vi.mock('../../utils/databaseService', () => ({
  databaseService: {
    list: vi.fn().mockImplementation((collection, filters) => {
      if (collection === 'content') {
        return Promise.resolve([
          { id: 'content-1', type: 'what_is_comet', content: 'Test COMET description' },
        ]);
      }
      return Promise.resolve([]);
    }),
    get: vi.fn().mockResolvedValue({ id: 'content-1', type: 'what_is_comet', content: 'Test COMET description' }),
    create: vi.fn().mockImplementation((collection, data, id) => {
      return Promise.resolve({ id: id || `${collection}-${Date.now()}`, ...data });
    }),
    update: vi.fn().mockImplementation((collection, id, data) => {
      return Promise.resolve({ id, ...data });
    }),
    delete: vi.fn().mockResolvedValue(true)
  },
}));

// Mock the LazyImage component
vi.mock('../../components/ui/LazyImage', () => ({
  default: ({ src, alt }) => (
    <div data-testid="lazy-image">
      <img src={src} alt={alt} />
    </div>
  ),
}));

// Mock the Button component
vi.mock('../../components/ui/Button', () => ({
  default: ({ children, onClick }) => (
    <button data-testid="button" onClick={onClick}>{children}</button>
  ),
}));

// Mock the HolographicText component
vi.mock('../../components/ui/HolographicText', () => ({
  default: ({ children }) => <div data-testid="holographic-text">{children}</div>,
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
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

describe('Home Page Integration', () => {
  const { listFiles } = require('../../utils/supabaseImageStorage');
  const { databaseService } = require('../../utils/databaseService');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays banner images from storage', async () => {
    renderWithProviders(<Home />);

    // Check that listFiles was called with the correct bucket type
    expect(listFiles).toHaveBeenCalledWith('banner');

    // Wait for the banner image to be displayed
    await waitFor(() => {
      const bannerImages = screen.getAllByTestId('lazy-image');
      expect(bannerImages.length).toBeGreaterThan(0);

      // Check that at least one banner image has the correct URL
      const bannerImage = bannerImages[0].querySelector('img');
      expect(bannerImage).toHaveAttribute('src', 'https://example.com/banner/image1.jpg');
    });
  });

  it('fetches and displays gallery images from storage', async () => {
    renderWithProviders(<Home />);

    // Check that listFiles was called with the correct bucket type
    expect(listFiles).toHaveBeenCalledWith('gallery');

    // Wait for the gallery images to be displayed
    await waitFor(() => {
      const galleryImages = screen.getAllByTestId('lazy-image');
      expect(galleryImages.length).toBeGreaterThan(1);

      // Check that gallery images have the correct URLs
      const imageSrcs = Array.from(screen.getAllByTestId('lazy-image'))
        .map(container => container.querySelector('img')?.getAttribute('src'));

      expect(imageSrcs).toContain('https://example.com/gallery/image1.jpg');
      expect(imageSrcs).toContain('https://example.com/gallery/image2.jpg');
    });
  });

  it('fetches and displays COMET description from database', async () => {
    renderWithProviders(<Home />);

    // Check that databaseService.list was called with the correct collection
    expect(databaseService.list).toHaveBeenCalledWith('content', [
      { key: 'type', value: 'what_is_comet' }
    ]);

    // Wait for the COMET description to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test COMET description')).toBeInTheDocument();
    });
  });

  it('displays template wizard button for authenticated users', async () => {
    renderWithProviders(<Home />);

    // Wait for the template wizard button to be displayed
    await waitFor(() => {
      const wizardButton = screen.getByTestId('button');
      expect(wizardButton).toHaveTextContent(/template wizard/i);
    });
  });

  it('does not display template wizard button for unauthenticated users', async () => {
    renderWithProviders(<Home />, { currentUser: null });

    // Wait for the component to render
    await waitFor(() => {
      const wizardButtons = screen.queryAllByText(/template wizard/i);
      expect(wizardButtons.length).toBe(0);
    });
  });
});
