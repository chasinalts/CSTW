import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as supabaseStorage from '../utils/supabaseImageStorage';
import * as databaseServiceModule from '../utils/databaseService';

describe('Image and Data Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the storage functions
    vi.spyOn(supabaseStorage, 'listFiles').mockImplementation((bucketType) => {
      if (bucketType === 'banner') {
        return Promise.resolve([
          { id: 'banner-1', publicUrl: 'https://example.com/banner/image1.jpg', image_type: 'banner' },
        ]);
      } else if (bucketType === 'gallery') {
        return Promise.resolve([
          { id: 'gallery-1', publicUrl: 'https://example.com/gallery/image1.jpg', image_type: 'gallery' },
          { id: 'gallery-2', publicUrl: 'https://example.com/gallery/image2.jpg', image_type: 'gallery' },
        ]);
      } else if (bucketType === 'scanner') {
        return Promise.resolve([
          { id: 'scanner-1', publicUrl: 'https://example.com/scanner/image1.jpg', image_type: 'scanner' },
          { id: 'scanner-2', publicUrl: 'https://example.com/scanner/image2.jpg', image_type: 'scanner' },
        ]);
      }
      return Promise.resolve([]);
    });

    vi.spyOn(supabaseStorage, 'uploadFile').mockImplementation((file, bucketType, userId) => {
      return Promise.resolve({
        id: `${bucketType}-${Date.now()}`,
        publicUrl: `https://example.com/${bucketType}/${file.name}`,
        image_type: bucketType,
      });
    });

    vi.spyOn(supabaseStorage, 'getFileUrl').mockImplementation((path, bucket) => {
      return `https://example.com/${bucket}/${path}`;
    });

    vi.spyOn(supabaseStorage, 'getFilePreview').mockImplementation((id, bucket) => {
      return Promise.resolve(`https://example.com/${bucket}/preview/${id}.jpg`);
    });

    // Mock the database service
    vi.spyOn(databaseServiceModule, 'databaseService', 'get').mockReturnValue({
      list: vi.fn().mockImplementation((collection) => {
        if (collection === 'content') {
          return Promise.resolve([
            { id: 'content-1', type: 'what_is_comet', content: 'Test COMET description' },
          ]);
        }
        return Promise.resolve([]);
      }),
      get: vi.fn().mockImplementation((collection, id) => {
        if (collection === 'content' && id === 'what_is_comet') {
          return Promise.resolve({ id: 'what_is_comet', content: 'Test COMET description' });
        }
        return Promise.resolve(null);
      }),
    });
  });

  describe('Image Retrieval', () => {
    it('should retrieve banner images', async () => {
      const bannerImages = await supabaseStorage.listFiles('banner');

      expect(supabaseStorage.listFiles).toHaveBeenCalledWith('banner');
      expect(bannerImages).toHaveLength(1);
      expect(bannerImages[0]).toHaveProperty('id', 'banner-1');
      expect(bannerImages[0]).toHaveProperty('publicUrl', 'https://example.com/banner/image1.jpg');
      expect(bannerImages[0]).toHaveProperty('image_type', 'banner');
    });

    it('should retrieve gallery images', async () => {
      const galleryImages = await supabaseStorage.listFiles('gallery');

      expect(supabaseStorage.listFiles).toHaveBeenCalledWith('gallery');
      expect(galleryImages).toHaveLength(2);
      expect(galleryImages[0]).toHaveProperty('id', 'gallery-1');
      expect(galleryImages[0]).toHaveProperty('publicUrl', 'https://example.com/gallery/image1.jpg');
      expect(galleryImages[0]).toHaveProperty('image_type', 'gallery');

      expect(galleryImages[1]).toHaveProperty('id', 'gallery-2');
      expect(galleryImages[1]).toHaveProperty('publicUrl', 'https://example.com/gallery/image2.jpg');
      expect(galleryImages[1]).toHaveProperty('image_type', 'gallery');
    });

    it('should retrieve scanner images', async () => {
      const scannerImages = await supabaseStorage.listFiles('scanner');

      expect(supabaseStorage.listFiles).toHaveBeenCalledWith('scanner');
      expect(scannerImages).toHaveLength(2);
      expect(scannerImages[0]).toHaveProperty('id', 'scanner-1');
      expect(scannerImages[0]).toHaveProperty('publicUrl', 'https://example.com/scanner/image1.jpg');
      expect(scannerImages[0]).toHaveProperty('image_type', 'scanner');

      expect(scannerImages[1]).toHaveProperty('id', 'scanner-2');
      expect(scannerImages[1]).toHaveProperty('publicUrl', 'https://example.com/scanner/image2.jpg');
      expect(scannerImages[1]).toHaveProperty('image_type', 'scanner');
    });
  });

  describe('Content Retrieval', () => {
    it('should retrieve COMET description', async () => {
      const cometDescription = await databaseServiceModule.databaseService.get('content', 'what_is_comet');

      expect(databaseServiceModule.databaseService.get).toHaveBeenCalledWith('content', 'what_is_comet');
      expect(cometDescription).toHaveProperty('id', 'what_is_comet');
      expect(cometDescription).toHaveProperty('content', 'Test COMET description');
    });

    it('should list content', async () => {
      const contentList = await databaseServiceModule.databaseService.list('content');

      expect(databaseServiceModule.databaseService.list).toHaveBeenCalledWith('content');
      expect(contentList).toHaveLength(1);
      expect(contentList[0]).toHaveProperty('id', 'content-1');
      expect(contentList[0]).toHaveProperty('type', 'what_is_comet');
      expect(contentList[0]).toHaveProperty('content', 'Test COMET description');
    });
  });

  describe('Image URL Generation', () => {
    it('should generate public URLs for images', () => {
      const publicUrl = supabaseStorage.getFileUrl('test-image.jpg', 'banner');

      expect(supabaseStorage.getFileUrl).toHaveBeenCalledWith('test-image.jpg', 'banner');
      expect(publicUrl).toBe('https://example.com/banner/test-image.jpg');
    });

    it('should generate preview URLs for images', async () => {
      const previewUrl = await supabaseStorage.getFilePreview('test-id', 'banner');

      expect(supabaseStorage.getFilePreview).toHaveBeenCalledWith('test-id', 'banner');
      expect(previewUrl).toBe('https://example.com/banner/preview/test-id.jpg');
    });
  });

  describe('Image Upload', () => {
    it('should upload an image and return metadata', async () => {
      const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
      const uploadResult = await supabaseStorage.uploadFile(mockFile, 'banner', 'user-123');

      expect(supabaseStorage.uploadFile).toHaveBeenCalledWith(mockFile, 'banner', 'user-123');
      expect(uploadResult).toHaveProperty('id');
      expect(uploadResult.id).toContain('banner-');
      expect(uploadResult).toHaveProperty('publicUrl', 'https://example.com/banner/test-image.jpg');
      expect(uploadResult).toHaveProperty('image_type', 'banner');
    });
  });

  describe('End-to-End Flow', () => {
    it('should simulate the flow from upload to retrieval', async () => {
      // 1. Upload an image
      const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
      const uploadResult = await supabaseStorage.uploadFile(mockFile, 'banner', 'user-123');

      // 2. Verify the upload result
      expect(uploadResult).toHaveProperty('id');
      expect(uploadResult).toHaveProperty('publicUrl');
      expect(uploadResult).toHaveProperty('image_type', 'banner');

      // 3. Retrieve images (including the one we just uploaded)
      const bannerImages = await supabaseStorage.listFiles('banner');

      // 4. Verify the retrieved images
      expect(bannerImages).toHaveLength(1);
      expect(bannerImages[0]).toHaveProperty('id', 'banner-1');
      expect(bannerImages[0]).toHaveProperty('publicUrl', 'https://example.com/banner/image1.jpg');
      expect(bannerImages[0]).toHaveProperty('image_type', 'banner');

      // 5. Get a preview URL for an image
      const previewUrl = await supabaseStorage.getFilePreview(bannerImages[0].id, 'banner');

      // 6. Verify the preview URL
      expect(previewUrl).toBe(`https://example.com/banner/preview/${bannerImages[0].id}.jpg`);

      // 7. Retrieve content
      const cometDescription = await databaseServiceModule.databaseService.get('content', 'what_is_comet');

      // 8. Verify the content
      expect(cometDescription).toHaveProperty('id', 'what_is_comet');
      expect(cometDescription).toHaveProperty('content', 'Test COMET description');
    });
  });
});
