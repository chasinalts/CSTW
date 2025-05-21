import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LazyImage from '../components/ui/LazyImage';
import { getFilePreview } from '../utils/supabaseImageStorage';

// Import test mocks
import '../setupTests';

// Mock useLazyLoading hook
vi.mock('../hooks/useLazyLoading', () => ({
  useLazyLoading: vi.fn().mockReturnValue({
    isVisible: true,
    ref: { current: null },
  }),
}));

describe('LazyImage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('renders with loading state initially', () => {
    render(<LazyImage src="https://example.com/test-image.jpg" alt="Test image" />);

    // Should show loading state initially
    expect(screen.getByTestId('image-loading')).toBeInTheDocument();
  });

  it('renders the image when loaded', async () => {
    render(<LazyImage src="https://example.com/test-image.jpg" alt="Test image" />);

    // Simulate image load
    const image = screen.getByRole('img');
    fireEvent.load(image);

    await waitFor(() => {
      expect(screen.queryByTestId('image-loading')).not.toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
    });
  });

  it('shows error state when image fails to load', async () => {
    render(<LazyImage src="https://example.com/invalid-image.jpg" alt="Invalid image" />);

    // Simulate image error
    const image = screen.getByRole('img');
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByTestId('image-error')).toBeInTheDocument();
    });
  });

  it('applies scale transformation correctly', async () => {
    render(
      <LazyImage
        src="https://example.com/test-image.jpg"
        alt="Test image"
        scale={1.5}
      />
    );

    // Simulate image load
    const image = screen.getByRole('img');
    fireEvent.load(image);

    await waitFor(() => {
      expect(image).toHaveStyle('transform: scale(1.5)');
    });
  });

  it('handles Supabase URLs correctly', async () => {
    render(
      <LazyImage
        src="https://supabase.example.com/storage/v1/object/test-image.jpg"
        alt="Supabase image"
      />
    );

    // Simulate image load
    const image = screen.getByRole('img');
    fireEvent.load(image);

    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'https://supabase.example.com/storage/v1/object/test-image.jpg');
    });
  });

  it('fetches preview URL for Appwrite file IDs', async () => {
    render(
      <LazyImage
        src="banner_123456"
        alt="Appwrite image"
      />
    );

    // Wait for the preview URL to be fetched
    await waitFor(() => {
      expect(getFilePreview).toHaveBeenCalledWith('banner_123456', expect.any(String));
    });
  });

  it('applies correct aspect ratio', async () => {
    render(
      <LazyImage
        src="https://example.com/test-image.jpg"
        alt="Test image"
        aspectRatio="16/9"
      />
    );

    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveStyle('aspect-ratio: 16/9');
  });

  it('applies gallery size controls when gallerySize is true', async () => {
    render(
      <LazyImage
        src="https://example.com/test-image.jpg"
        alt="Gallery image"
        gallerySize={true}
      />
    );

    // Check if gallery controls are rendered
    expect(screen.getByTestId('gallery-controls')).toBeInTheDocument();
  });
});
