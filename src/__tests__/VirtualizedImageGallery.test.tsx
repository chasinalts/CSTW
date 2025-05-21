import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtualizedImageGallery from '../components/ui/VirtualizedImageGallery';

// Import test mocks
import '../setupTests';

describe('VirtualizedImageGallery Component', () => {
  // Sample gallery images
  const mockImages = [
    { id: '1', src: 'https://example.com/image1.jpg', alt: 'Image 1', scale: 1 },
    { id: '2', src: 'https://example.com/image2.jpg', alt: 'Image 2', scale: 1.2 },
    { id: '3', src: 'https://example.com/image3.jpg', alt: 'Image 3', scale: 0.9 },
    { id: '4', src: 'https://example.com/image4.jpg', alt: 'Image 4', scale: 1 },
    { id: '5', src: 'https://example.com/image5.jpg', alt: 'Image 5', scale: 1.1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gallery with correct number of images', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        onImageClick={() => {}}
      />
    );

    // Check that all images are rendered
    const galleryImages = screen.getAllByTestId('lazy-image');
    expect(galleryImages.length).toBe(mockImages.length);
  });

  it('calls onImageClick when an image is clicked', () => {
    const handleImageClick = vi.fn();

    render(
      <VirtualizedImageGallery
        images={mockImages}
        onImageClick={handleImageClick}
      />
    );

    // Click on the first image
    const galleryImages = screen.getAllByTestId('lazy-image');
    fireEvent.click(galleryImages[0]);

    // Check that onImageClick was called with the correct image
    expect(handleImageClick).toHaveBeenCalledWith(mockImages[0]);
  });

  it('renders with custom className', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        onImageClick={() => {}}
        className="custom-gallery"
      />
    );

    // Check that the custom class is applied
    const gallery = screen.getByTestId('virtualized-gallery');
    expect(gallery).toHaveClass('custom-gallery');
  });

  it('renders with custom item className', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        onImageClick={() => {}}
        itemClassName="custom-item"
      />
    );

    // Check that all items have the custom class
    const galleryItems = screen.getAllByTestId('gallery-item');
    galleryItems.forEach(item => {
      expect(item).toHaveClass('custom-item');
    });
  });

  it('renders with custom loading strategy', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        onImageClick={() => {}}
        loadingStrategy="eager"
      />
    );

    // Check that all images have the eager loading strategy
    const galleryImages = screen.getAllByTestId('lazy-image');
    galleryImages.forEach(image => {
      expect(image).toHaveAttribute('loadingStrategy', 'eager');
    });
  });

  it('renders empty state when no images are provided', () => {
    render(
      <VirtualizedImageGallery
        images={[]}
        onImageClick={() => {}}
        emptyStateMessage="No images found"
      />
    );

    // Check that the empty state message is displayed
    expect(screen.getByText('No images found')).toBeInTheDocument();
  });

  it('applies correct scale to images', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        onImageClick={() => {}}
      />
    );

    // Check that all images have the correct scale
    const galleryImages = screen.getAllByTestId('lazy-image');

    // Check the second image which has scale 1.2
    expect(galleryImages[1]).toHaveStyle('transform: scale(1.2)');

    // Check the third image which has scale 0.9
    expect(galleryImages[2]).toHaveStyle('transform: scale(0.9)');
  });
});
