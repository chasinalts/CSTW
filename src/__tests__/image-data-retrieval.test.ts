import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listFiles, getFileUrl, getFilePreview } from '../utils/supabaseImageStorage';
import { databaseService } from '../utils/databaseService';
import { mockSupabaseClient } from './mocks/supabaseMock';

// Import the mocks from setupTests.ts
import '../setupTests';

describe('Image and Data Retrieval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Banner Image Retrieval', () => {
    it('should fetch banner images from the database', async () => {
      const bannerImages = await listFiles('banner');

      // Check that the database service was called with the correct parameters
      expect(databaseService.list).toHaveBeenCalledWith('images', [
        { key: 'image_type', value: 'banner' }
      ]);

      // Check that the result contains the expected data
      expect(bannerImages).toEqual([
        expect.objectContaining({
          id: 'banner-1',
          file_path: 'banner/image1.jpg',
          image_type: 'banner',
        })
      ]);
    });

    it('should generate public URLs for banner images', async () => {
      const bannerImages = await listFiles('banner');

      // Check that each banner image has a public URL
      bannerImages.forEach(image => {
        expect(image).toHaveProperty('publicUrl');
        expect(image.publicUrl).toContain('https://example.com');
      });
    });
  });

  describe('Gallery Image Retrieval', () => {
    it('should fetch gallery images from the database', async () => {
      const galleryImages = await listFiles('gallery');

      // Check that the database service was called with the correct parameters
      expect(databaseService.list).toHaveBeenCalledWith('images', [
        { key: 'image_type', value: 'gallery' }
      ]);

      // Check that the result contains the expected data
      expect(galleryImages).toEqual([
        expect.objectContaining({
          id: 'gallery-1',
          file_path: 'gallery/image1.jpg',
          image_type: 'gallery',
        }),
        expect.objectContaining({
          id: 'gallery-2',
          file_path: 'gallery/image2.jpg',
          image_type: 'gallery',
        })
      ]);
    });

    it('should generate public URLs for gallery images', async () => {
      const galleryImages = await listFiles('gallery');

      // Check that each gallery image has a public URL
      galleryImages.forEach(image => {
        expect(image).toHaveProperty('publicUrl');
        expect(image.publicUrl).toContain('https://example.com');
      });
    });
  });

  describe('Scanner Image Retrieval', () => {
    it('should fetch scanner images from the database', async () => {
      const scannerImages = await listFiles('scanner');

      // Check that the database service was called with the correct parameters
      expect(databaseService.list).toHaveBeenCalledWith('images', [
        { key: 'image_type', value: 'scanner' }
      ]);

      // Check that the result contains the expected data
      expect(scannerImages).toEqual([
        expect.objectContaining({
          id: 'scanner-1',
          file_path: 'scanner/image1.jpg',
          image_type: 'scanner',
        }),
        expect.objectContaining({
          id: 'scanner-2',
          file_path: 'scanner/image2.jpg',
          image_type: 'scanner',
        })
      ]);
    });

    it('should generate public URLs for scanner images', async () => {
      const scannerImages = await listFiles('scanner');

      // Check that each scanner image has a public URL
      scannerImages.forEach(image => {
        expect(image).toHaveProperty('publicUrl');
        expect(image.publicUrl).toContain('https://example.com');
      });
    });
  });

  describe('Content Retrieval', () => {
    it('should fetch COMET description from the database', async () => {
      const cometDescription = await databaseService.get('content', 'what_is_comet');

      // Check that the database service was called with the correct parameters
      expect(databaseService.get).toHaveBeenCalledWith('content', 'what_is_comet');

      // Check that the result contains the expected data
      expect(cometDescription).toEqual(expect.objectContaining({
        id: 'what_is_comet',
        content: 'Test COMET description',
      }));
    });
  });

  describe('Image URL Generation', () => {
    it('should generate public URLs for images', () => {
      const publicUrl = getFileUrl('test-path', 'banner');

      // Check that the URL was generated correctly
      expect(publicUrl).toBe('https://example.com/test-image.jpg');
    });

    it('should generate preview URLs for images', async () => {
      // Mock the implementation for this specific test
      vi.mocked(databaseService.list).mockResolvedValueOnce([
        { id: 'test-id', file_path: 'banner/test-image.jpg', image_type: 'banner' }
      ]);

      const previewUrl = await getFilePreview('test-id', 'banner');

      // Check that the database service was called to get the file path
      expect(databaseService.list).toHaveBeenCalledWith('images', [
        { key: 'id', value: 'test-id' }
      ]);

      // Check that the URL was generated correctly
      expect(previewUrl).toBe('https://example.com/test-image.jpg');
    });
  });
});
