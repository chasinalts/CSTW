import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/ui/Toast';
import AdminDashboard from '../pages/AdminDashboard';
import { listFiles, deleteFile } from '../utils/supabaseImageStorage';
import { databaseService } from '../utils/databaseService';
import { handleImageUpload } from '../utils/imageHandlers';

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

const renderWithProviders = (ui: React.ReactElement, { currentUser = mockUser } = {}) => {
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
      <ThemeProvider>
        <ToastProvider>
          <MemoryRouter>{ui}</MemoryRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('should fetch and display banner images', async () => {
    renderWithProviders(<AdminDashboard />);

    // Check that banner images are being fetched
    expect(listFiles).toHaveBeenCalledWith('banner');

    // Wait for the banner images to be displayed
    await waitFor(() => {
      const bannerImages = screen.getAllByTestId('lazy-image');
      expect(bannerImages.length).toBeGreaterThan(0);

      // Check that at least one banner image has the correct URL
      const bannerImageSrcs = bannerImages.map(img => img.getAttribute('src'));
      expect(bannerImageSrcs).toContain('https://example.com/banner/banner-1.jpg');
    });
  });

  it('should fetch and display gallery images', async () => {
    renderWithProviders(<AdminDashboard />);

    // Check that gallery images are being fetched
    expect(listFiles).toHaveBeenCalledWith('gallery');

    // Wait for the gallery images to be displayed
    await waitFor(() => {
      const galleryImages = screen.getAllByTestId('lazy-image');
      expect(galleryImages.length).toBeGreaterThan(0);

      // Check that at least one gallery image has the correct URL
      const galleryImageSrcs = galleryImages.map(img => img.getAttribute('src'));
      expect(galleryImageSrcs).toContain('https://example.com/gallery/gallery-1.jpg');
      expect(galleryImageSrcs).toContain('https://example.com/gallery/gallery-2.jpg');
    });
  });

  it('should allow uploading a banner image', async () => {
    renderWithProviders(<AdminDashboard />);

    // Wait for the dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });

    // Find the banner image upload input
    const bannerUploadInput = screen.getByLabelText(/upload banner/i);

    // Create a mock file
    const mockFile = new File(['test'], 'banner.jpg', { type: 'image/jpeg' });

    // Upload the banner image
    await act(async () => {
      fireEvent.change(bannerUploadInput, { target: { files: [mockFile] } });
    });

    // Check that handleImageUpload was called with the correct parameters
    expect(handleImageUpload).toHaveBeenCalledWith(
      mockFile,
      'banner',
      expect.any(Function),
      expect.any(Function),
      'test-user',
      expect.any(String)
    );
  });

  it('should allow uploading gallery images', async () => {
    renderWithProviders(<AdminDashboard />);

    // Wait for the dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });

    // Find the gallery image upload input
    const galleryUploadInput = screen.getByLabelText(/upload gallery/i);

    // Create mock files
    const mockFile1 = new File(['test1'], 'gallery1.jpg', { type: 'image/jpeg' });
    const mockFile2 = new File(['test2'], 'gallery2.jpg', { type: 'image/jpeg' });

    // Upload the gallery images
    await act(async () => {
      fireEvent.change(galleryUploadInput, { target: { files: [mockFile1, mockFile2] } });
    });

    // Check that handleImageUpload was called for each file
    expect(handleImageUpload).toHaveBeenCalledTimes(2);
  });

  it('should allow deleting images', async () => {
    renderWithProviders(<AdminDashboard />);

    // Wait for the images to be displayed
    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/delete/i);
      expect(deleteButtons.length).toBeGreaterThan(0);

      // Click on the first delete button
      fireEvent.click(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = screen.getByText(/confirm/i);
      fireEvent.click(confirmButton);

      // Check that deleteFile was called
      expect(deleteFile).toHaveBeenCalled();
    });
  });

  it('should allow editing COMET description', async () => {
    renderWithProviders(<AdminDashboard />);

    // Wait for the COMET description to be displayed
    await waitFor(() => {
      expect(screen.getByText(/what is comet/i)).toBeInTheDocument();
    });

    // Click on the edit button
    const editButton = screen.getByText(/edit description/i);
    fireEvent.click(editButton);

    // Find the textarea and update the content
    const textarea = screen.getByLabelText(/comet description/i);
    fireEvent.change(textarea, { target: { value: 'Updated COMET description' } });

    // Save the changes
    const saveButton = screen.getByText(/save changes/i);
    fireEvent.click(saveButton);

    // Check that the description was updated
    expect(databaseService.update).toHaveBeenCalledWith(
      'content',
      'content-1',
      expect.objectContaining({
        content: 'Updated COMET description',
      })
    );
  });

  it('should not allow non-owner users to access certain features', async () => {
    // Render the admin dashboard with a non-owner user
    renderWithProviders(<AdminDashboard />, {
      currentUser: {
        ...mockUser,
        is_owner: false,
        permissions: {
          ...mockUser.permissions,
          media_uploads: false,
          user_management: false,
        },
      },
    });

    // Wait for the dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });

    // Check that the image upload sections are not visible
    expect(screen.queryByLabelText(/upload banner/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/upload gallery/i)).not.toBeInTheDocument();

    // Check that the user management section is not visible
    expect(screen.queryByText(/user management/i)).not.toBeInTheDocument();
  });
});
