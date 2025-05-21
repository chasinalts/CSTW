import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { listFiles, uploadFile, deleteFile } from '../../utils/supabaseImageStorage';
import { databaseService } from '../../utils/databaseService';

// Mock data
const mockBannerImages = [
  {
    id: 'banner-1',
    file_path: 'banner/image1.jpg',
    publicUrl: 'https://example.com/banner/image1.jpg',
    image_type: 'banner',
    name: 'Banner Image 1',
  }
];

const mockGalleryImages = [
  {
    id: 'gallery-1',
    file_path: 'gallery/image1.jpg',
    publicUrl: 'https://example.com/gallery/image1.jpg',
    image_type: 'gallery',
    name: 'Gallery Image 1',
  },
  {
    id: 'gallery-2',
    file_path: 'gallery/image2.jpg',
    publicUrl: 'https://example.com/gallery/image2.jpg',
    image_type: 'gallery',
    name: 'Gallery Image 2',
  }
];

const mockContent = [
  {
    id: 'what_is_comet',
    type: 'what_is_comet',
    content: 'COMET (Comprehensive Operational Medical Emergency Toolkit) is a revolutionary system.'
  }
];

// Set up MSW server
const server = setupServer(
  // Handler for Supabase storage from endpoint
  http.get('https://example.supabase.co/storage/v1/object/public/:bucket/:path', () => {
    return HttpResponse.json({ publicUrl: 'https://example.com/storage/image.jpg' });
  }),

  // Handler for Supabase storage list endpoint
  http.get('https://example.supabase.co/storage/v1/bucket/:bucket/list', ({ params }) => {
    const { bucket } = params;

    if (bucket === 'banner') {
      return HttpResponse.json({ data: mockBannerImages.map(img => ({ name: img.name })) });
    } else if (bucket === 'gallery') {
      return HttpResponse.json({ data: mockGalleryImages.map(img => ({ name: img.name })) });
    }

    return HttpResponse.json({ data: [] });
  }),

  // Handler for Supabase storage upload endpoint
  http.post('https://example.supabase.co/storage/v1/object/:bucket', () => {
    return HttpResponse.json({
      Key: 'test-path',
      ETag: 'test-etag',
    });
  }),

  // Handler for Supabase database images table
  http.get('https://example.supabase.co/rest/v1/images', ({ request }) => {
    const url = new URL(request.url);
    const imageType = url.searchParams.get('image_type');

    if (imageType === 'banner') {
      return HttpResponse.json(mockBannerImages);
    } else if (imageType === 'gallery') {
      return HttpResponse.json(mockGalleryImages);
    }

    return HttpResponse.json([...mockBannerImages, ...mockGalleryImages]);
  }),

  // Handler for Supabase database content table
  http.get('https://example.supabase.co/rest/v1/content', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    if (type) {
      return HttpResponse.json(mockContent.filter(item => item.type === type));
    }

    return HttpResponse.json(mockContent);
  }),

  // Handler for Supabase database insert
  http.post('https://example.supabase.co/rest/v1/:table', async ({ params, request }) => {
    const { table } = params;
    const data = await request.json();

    if (table === 'images') {
      const newImage = {
        id: `${data.image_type}-${Date.now()}`,
        ...data,
        publicUrl: `https://example.com/${data.image_type}/new-image.jpg`,
      };

      return HttpResponse.json([newImage]);
    }

    return HttpResponse.json([{ id: `${table}-${Date.now()}`, ...data }]);
  }),

  // Handler for Supabase database delete
  http.delete('https://example.supabase.co/rest/v1/:table', () => {
    return HttpResponse.json({ count: 1 });
  })
);

// Start server before all tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

// Mock the Supabase client
vi.mock('../../supabaseConfig', () => ({
  supabaseClient: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test-image.jpg' } }),
        list: vi.fn().mockResolvedValue({ data: [{ name: 'test-image.jpg' }], error: null }),
        remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation(callback => callback({
        data: mockBannerImages,
        error: null
      })),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    }),
  },
  BANNER_BUCKET: 'banner',
  GALLERY_BUCKET: 'gallery',
  SCANNER_BUCKET: 'scanner',
  IMAGES_TABLE: 'images',
  EXTENDED_CONTENT_TABLE: 'extended_content',
  LOGS_TABLE: 'logs',
  TEMPLATES_TABLE: 'templates',
}));

// Mock image compression
vi.mock('../../utils/imageCompression', () => ({
  processImageForUpload: vi.fn().mockImplementation((file) => Promise.resolve(file)),
}));

describe('Image API with MSW', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listFiles', () => {
    it('should fetch banner images from Supabase', async () => {
      const images = await listFiles('banner');

      expect(images).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'banner-1',
          publicUrl: 'https://example.com/banner/image1.jpg',
          image_type: 'banner',
        })
      ]));
    });

    it('should fetch gallery images from Supabase', async () => {
      const images = await listFiles('gallery');

      expect(images).toEqual(expect.arrayContaining([
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
      ]));
    });
  });

  describe('uploadFile', () => {
    it('should upload a file to Supabase storage', async () => {
      const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
      const result = await uploadFile(mockFile, 'banner', 'user-123');

      expect(result).toHaveProperty('$id');
      expect(result).toHaveProperty('publicUrl', 'https://example.com/test-image.jpg');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file from Supabase storage', async () => {
      const result = await deleteFile('banner-1');

      expect(result).toBeTruthy();
    });
  });

  describe('databaseService', () => {
    it('should fetch content from Supabase database', async () => {
      const content = await databaseService.list('content', [
        { key: 'type', value: 'what_is_comet' }
      ]);

      expect(content).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'what_is_comet',
          type: 'what_is_comet',
          content: expect.stringContaining('COMET'),
        })
      ]));
    });
  });
});
