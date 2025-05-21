import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/Home';
import { listFiles } from '../utils/supabaseImageStorage';
import { databaseService } from '../utils/databaseService';
import { AuthContext } from '../contexts/AuthContext';

// Import test mocks
import '../setupTests';

// Mock AuthContext
const mockUser = {
  id: 'test-user',
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

const renderWithAuth = (ui: React.ReactElement, { currentUser = mockUser } = {}) => {
  return render(
    <AuthContext.Provider value={{
      currentUser,
      session: {},
      login: vi.fn(),
      signup: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    } as any}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and display banner image', async () => {
    renderWithAuth(<Home />);

    // Check that the banner image is being fetched
    expect(listFiles).toHaveBeenCalledWith('banner');

    // Wait for the banner image to be displayed
    await waitFor(() => {
      const bannerImage = screen.getByTestId('lazy-image');
      expect(bannerImage).toHaveAttribute('src', 'https://example.com/banner.jpg');
    });
  });

  it('should fetch and display gallery images', async () => {
    renderWithAuth(<Home />);

    // Check that the gallery images are being fetched
    expect(listFiles).toHaveBeenCalledWith('gallery');

    // Wait for the gallery images to be displayed
    await waitFor(() => {
      const galleryImages = screen.getAllByTestId('lazy-image');
      // First image is banner, rest are gallery
      expect(galleryImages.length).toBeGreaterThan(1);

      // Check that at least one gallery image has the correct URL
      const galleryImageSrcs = galleryImages.map(img => img.getAttribute('src'));
      expect(galleryImageSrcs).toContain('https://example.com/gallery1.jpg');
      expect(galleryImageSrcs).toContain('https://example.com/gallery2.jpg');
    });
  });

  it('should fetch and display COMET description', async () => {
    renderWithAuth(<Home />);

    // Check that the COMET description is being fetched
    expect(databaseService.list).toHaveBeenCalledWith('content', [
      { key: 'type', value: 'what_is_comet' }
    ]);

    // Wait for the COMET description to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test COMET description')).toBeInTheDocument();
    });
  });

  it('should display template wizard button for authenticated users', async () => {
    renderWithAuth(<Home />);

    // Wait for the template wizard button to be displayed
    await waitFor(() => {
      const wizardButton = screen.getByTestId('button');
      expect(wizardButton).toHaveTextContent(/template wizard/i);
    });
  });

  it('should not display template wizard button for unauthenticated users', async () => {
    renderWithAuth(<Home />, { currentUser: null });

    // Wait for the component to render
    await waitFor(() => {
      const wizardButtons = screen.queryAllByText(/template wizard/i);
      expect(wizardButtons.length).toBe(0);
    });
  });

  it('should display fullscreen image when a gallery image is clicked', async () => {
    renderWithAuth(<Home />);

    // Wait for the gallery images to be displayed
    await waitFor(() => {
      const galleryImages = screen.getAllByTestId('lazy-image');
      expect(galleryImages.length).toBeGreaterThan(1);

      // Click on a gallery image
      galleryImages[1].click();

      // Check that the fullscreen image is displayed
      const fullscreenImage = screen.getByTestId('fullscreen-image');
      expect(fullscreenImage).toBeInTheDocument();
    });
  });
});
