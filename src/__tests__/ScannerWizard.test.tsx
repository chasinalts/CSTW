import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/ui/Toast';
import { WizardProvider } from '../contexts/WizardContext';
import ScannerWizard from '../pages/ScannerWizard';
import { listFiles } from '../utils/supabaseImageStorage';
import { databaseService } from '../utils/databaseService';

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
          <WizardProvider>
            <MemoryRouter>{ui}</MemoryRouter>
          </WizardProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

describe('ScannerWizard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and display scanner images', async () => {
    renderWithProviders(<ScannerWizard />);

    // Check that scanner images are being fetched
    expect(listFiles).toHaveBeenCalledWith('scanner');

    // Wait for the scanner images to be displayed
    await waitFor(() => {
      const scannerImages = screen.getAllByTestId('lazy-image');
      expect(scannerImages.length).toBeGreaterThan(0);

      // Check that the scanner images have the correct src attributes
      scannerImages.forEach(img => {
        expect(img).toHaveAttribute('src', expect.stringContaining('scanner'));
      });
    });
  });

  it('should fetch and display templates', async () => {
    renderWithProviders(<ScannerWizard />);

    // Check that templates are being fetched
    expect(databaseService.list).toHaveBeenCalledWith('templates');

    // Wait for the templates to be displayed
    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 2')).toBeInTheDocument();
    });
  });

  it('should allow selecting a scanner image', async () => {
    renderWithProviders(<ScannerWizard />);

    // Wait for the scanner images to be displayed
    await waitFor(() => {
      const scannerImages = screen.getAllByTestId('lazy-image');
      expect(scannerImages.length).toBeGreaterThan(0);

      // Click on the first scanner image
      fireEvent.click(scannerImages[0]);

      // Check that the image is selected (this would typically add a class or visual indicator)
      expect(scannerImages[0]).toHaveClass('selected');
    });
  });

  it('should allow selecting a template', async () => {
    renderWithProviders(<ScannerWizard />);

    // Wait for the templates to be displayed
    await waitFor(() => {
      const templateButtons = screen.getAllByText(/Template \d/);
      expect(templateButtons.length).toBeGreaterThan(0);

      // Click on the first template
      fireEvent.click(templateButtons[0]);

      // Check that the template is selected
      expect(templateButtons[0]).toHaveClass('selected');
    });
  });

  it('should allow creating a new template', async () => {
    renderWithProviders(<ScannerWizard />);

    // Wait for the wizard to load
    await waitFor(() => {
      expect(screen.getByText(/create new template/i)).toBeInTheDocument();
    });

    // Click on the create new template button
    fireEvent.click(screen.getByText(/create new template/i));

    // Fill in the template form
    const titleInput = screen.getByLabelText(/template title/i);
    const contentInput = screen.getByLabelText(/template content/i);

    fireEvent.change(titleInput, { target: { value: 'New Template' } });
    fireEvent.change(contentInput, { target: { value: 'New Template Content' } });

    // Submit the form
    fireEvent.click(screen.getByText(/save template/i));

    // Check that the template was created
    expect(databaseService.create).toHaveBeenCalledWith(
      'templates',
      expect.objectContaining({
        title: 'New Template',
        content: 'New Template Content',
        created_by: 'test-user',
      }),
      expect.any(String)
    );
  });

  it('should allow navigating through wizard steps', async () => {
    renderWithProviders(<ScannerWizard />);

    // Wait for the wizard to load
    await waitFor(() => {
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    });

    // Select a scanner image
    const scannerImages = await screen.findAllByTestId('lazy-image');
    fireEvent.click(scannerImages[0]);

    // Click next button
    fireEvent.click(screen.getByText(/next/i));

    // Check that we're on step 2
    expect(screen.getByText(/step 2/i)).toBeInTheDocument();

    // Select a template
    const templateButtons = await screen.findAllByText(/Template \d/);
    fireEvent.click(templateButtons[0]);

    // Click next button
    fireEvent.click(screen.getByText(/next/i));

    // Check that we're on step 3
    expect(screen.getByText(/step 3/i)).toBeInTheDocument();

    // Click finish button
    fireEvent.click(screen.getByText(/finish/i));

    // Check that the template was saved
    expect(databaseService.create).toHaveBeenCalled();
  });
});
