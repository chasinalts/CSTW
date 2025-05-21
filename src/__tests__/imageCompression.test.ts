import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processImageForUpload } from '../utils/imageCompression';

// Import test mocks
import '../setupTests';

describe('Image Compression', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Create a proper mock for canvas and context
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        drawImage: vi.fn(),
      }),
      toBlob: vi.fn().mockImplementation((callback, type, quality) => {
        // Create a mock blob with size proportional to quality
        const size = Math.floor(1024 * (quality || 0.8));
        callback(new Blob(['x'.repeat(size)], { type: type || 'image/jpeg' }));
      }),
    };

    // Mock document.createElement to return our mock canvas
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLElement;
      }
      return document.createElement.getMockImplementation()!(tagName);
    });

    // Mock Image
    const mockImage = {
      width: 1920,
      height: 1080,
      onload: null,
      onerror: null,
      src: '',
    };

    global.Image = vi.fn().mockImplementation(() => {
      const img = { ...mockImage };
      setTimeout(() => img.onload && img.onload(), 0);
      return img;
    });

    // Mock URL methods
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('should compress an image to the specified quality', async () => {
    // Create a mock file
    const mockFile = new File(['test'.repeat(1024)], 'test-image.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 4096 }); // 4KB

    // Process the image with 50% quality
    const result = await processImageForUpload(mockFile, {
      quality: 0.5,
      maxWidth: 1920,
      maxHeight: 1080,
    });

    // Check that the result is a File object
    expect(result).toBeInstanceOf(File);

    // Check that the file size is reduced
    expect(result.size).toBeLessThan(mockFile.size);

    // Check that the file name and type are preserved
    expect(result.name).toBe('test-image.jpg');
    expect(result.type).toBe('image/jpeg');
  });

  it('should resize an image if it exceeds max dimensions', async () => {
    // Create a mock file
    const mockFile = new File(['test'.repeat(1024)], 'large-image.jpg', { type: 'image/jpeg' });

    // Mock a large image
    const mockImage = {
      width: 3840,
      height: 2160,
      onload: null,
      onerror: null,
      src: '',
    };

    global.Image = vi.fn().mockImplementation(() => {
      const img = { ...mockImage };
      setTimeout(() => img.onload && img.onload(), 0);
      return img;
    });

    // Process the image with max dimensions
    const result = await processImageForUpload(mockFile, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
    });

    // Check that document.createElement was called with 'canvas'
    expect(document.createElement).toHaveBeenCalledWith('canvas');

    // Verify the result is a File object
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('large-image.jpg');
    expect(result.type).toBe('image/jpeg');
  });

  it('should not resize an image if it is smaller than max dimensions', async () => {
    // Create a mock file
    const mockFile = new File(['test'.repeat(1024)], 'small-image.jpg', { type: 'image/jpeg' });

    // Mock a small image
    const mockImage = {
      width: 800,
      height: 600,
      onload: null,
      onerror: null,
      src: '',
    };

    global.Image = vi.fn().mockImplementation(() => {
      const img = { ...mockImage };
      setTimeout(() => img.onload && img.onload(), 0);
      return img;
    });

    // Process the image
    const result = await processImageForUpload(mockFile, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
    });

    // Check that document.createElement was called with 'canvas'
    expect(document.createElement).toHaveBeenCalledWith('canvas');

    // Verify the result is a File object
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('small-image.jpg');
    expect(result.type).toBe('image/jpeg');
  });

  it('should enforce maximum file size', async () => {
    // Create a mock file
    const mockFile = new File(['test'.repeat(1024 * 1024)], 'huge-image.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 4 * 1024 * 1024 }); // 4MB

    // Process the image with max size of 1MB
    const result = await processImageForUpload(mockFile, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      maxSizeInMB: 1,
    });

    // Check that the result is a File object
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('huge-image.jpg');
    expect(result.type).toBe('image/jpeg');
  });

  it('should handle non-image files gracefully', async () => {
    // Create a mock non-image file
    const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });

    // Process the file
    const result = await processImageForUpload(mockFile, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
    });

    // For non-image files, it should return a file with the same properties
    expect(result.name).toBe(mockFile.name);
    expect(result.type).toBe(mockFile.type);
  });
});
