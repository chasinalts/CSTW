import { describe, it, expect, vi } from 'vitest';

// Create a simple mock for the canvas.toBlob method
const mockToBlob = vi.fn((callback, type = 'image/jpeg', quality = 0.8) => {
  const blob = new Blob(['test'], { type });
  setTimeout(() => callback(blob), 0);
});

describe('Canvas toBlob Mock', () => {
  it('should mock the toBlob method', () => {
    // Create a simple test that doesn't rely on document.createElement
    const mockCanvas = {
      toBlob: mockToBlob
    };

    // Call the toBlob method
    mockCanvas.toBlob((blob) => {
      expect(blob).toBeDefined();
      expect(blob instanceof Blob).toBe(true);
    });

    // Check that the toBlob method was called
    expect(mockToBlob).toHaveBeenCalled();
  });
});
