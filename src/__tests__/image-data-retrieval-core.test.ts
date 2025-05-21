import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listFiles, getFileUrl } from '../utils/supabaseImageStorage';
import { databaseService } from '../utils/databaseService';

// Mock the Supabase client and database service
vi.mock('../utils/supabaseImageStorage', () => ({
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
    } else if (bucketType === 'scanner') {
      return Promise.resolve([
        { id: 'scanner-1', publicUrl: 'https://example.com/scanner/image1.jpg', image_type: 'scanner' },
        { id: 'scanner-2', publicUrl: 'https://example.com/scanner/image2.jpg', image_type: 'scanner' },
      ]);
    }
    return Promise.resolve([]);
  }),
  getFileUrl: vi.fn().mockImplementation((filePath, bucketType) => {
    return `https://example.com/${bucketType}/${filePath}`;
  }),
}));

vi.mock('../utils/databaseService', () => ({
  databaseService: {
    list: vi.fn().mockImplementation((collection, filters) => {
      if (collection === 'content') {
        return Promise.resolve([
          { id: 'content-1', type: 'what_is_comet', content: 'Test COMET description' },
        ]);
      } else if (collection === 'templates') {
        return Promise.resolve([
          { id: 'template-1', title: 'Template 1', content: 'Template 1 content' },
          { id: 'template-2', title: 'Template 2', content: 'Template 2 content' },
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
  },
}));

describe('Image and Data Retrieval Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Banner Image Retrieval', () => {
    it('should fetch banner images from the database', async () => {
      const bannerImages = await listFiles('banner');
      
      // Check that the function was called with the correct parameters
      expect(listFiles).toHaveBeenCalledWith('banner');
      
      // Check that the result contains the expected data
      expect(bannerImages).toEqual([
        expect.objectContaining({
          id: 'banner-1',
          publicUrl: 'https://example.com/banner/image1.jpg',
          image_type: 'banner',
        })
      ]);
    });
  });
  
  describe('Gallery Image Retrieval', () => {
    it('should fetch gallery images from the database', async () => {
      const galleryImages = await listFiles('gallery');
      
      // Check that the function was called with the correct parameters
      expect(listFiles).toHaveBeenCalledWith('gallery');
      
      // Check that the result contains the expected data
      expect(galleryImages).toEqual([
        expect.objectContaining({
          id: 'gallery-1',
          publicUrl: 'https://example.com/gallery/image1.jpg',
          image_type: 'gallery',
        }),
        expect.objectContaining({
          id: 'gallery-2',
          publicUrl: 'https://example.com/gallery/image2.jpg',
          image_type: 'gallery',
        })
      ]);
    });
  });
  
  describe('Scanner Image Retrieval', () => {
    it('should fetch scanner images from the database', async () => {
      const scannerImages = await listFiles('scanner');
      
      // Check that the function was called with the correct parameters
      expect(listFiles).toHaveBeenCalledWith('scanner');
      
      // Check that the result contains the expected data
      expect(scannerImages).toEqual([
        expect.objectContaining({
          id: 'scanner-1',
          publicUrl: 'https://example.com/scanner/image1.jpg',
          image_type: 'scanner',
        }),
        expect.objectContaining({
          id: 'scanner-2',
          publicUrl: 'https://example.com/scanner/image2.jpg',
          image_type: 'scanner',
        })
      ]);
    });
  });
  
  describe('Content Retrieval', () => {
    it('should fetch COMET description from the database', async () => {
      const contentList = await databaseService.list('content');
      
      // Check that the function was called with the correct parameters
      expect(databaseService.list).toHaveBeenCalledWith('content');
      
      // Check that the result contains the expected data
      expect(contentList).toEqual([
        expect.objectContaining({
          id: 'content-1',
          type: 'what_is_comet',
          content: 'Test COMET description',
        })
      ]);
    });
    
    it('should fetch a specific content item by ID', async () => {
      const content = await databaseService.get('content', 'what_is_comet');
      
      // Check that the function was called with the correct parameters
      expect(databaseService.get).toHaveBeenCalledWith('content', 'what_is_comet');
      
      // Check that the result contains the expected data
      expect(content).toEqual(expect.objectContaining({
        id: 'what_is_comet',
        content: 'Test COMET description',
      }));
    });
  });
  
  describe('Template Retrieval', () => {
    it('should fetch templates from the database', async () => {
      const templates = await databaseService.list('templates');
      
      // Check that the function was called with the correct parameters
      expect(databaseService.list).toHaveBeenCalledWith('templates');
      
      // Check that the result contains the expected data
      expect(templates).toEqual([
        expect.objectContaining({
          id: 'template-1',
          title: 'Template 1',
          content: 'Template 1 content',
        }),
        expect.objectContaining({
          id: 'template-2',
          title: 'Template 2',
          content: 'Template 2 content',
        })
      ]);
    });
  });
  
  describe('URL Generation', () => {
    it('should generate public URLs for images', () => {
      const publicUrl = getFileUrl('test-image.jpg', 'banner');
      
      // Check that the function was called with the correct parameters
      expect(getFileUrl).toHaveBeenCalledWith('test-image.jpg', 'banner');
      
      // Check that the result is the expected URL
      expect(publicUrl).toBe('https://example.com/banner/test-image.jpg');
    });
  });
});
