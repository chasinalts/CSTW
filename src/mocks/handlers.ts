import { http, HttpResponse } from 'msw';

// Mock data for images
const mockBannerImages = [
  {
    id: 'banner-1',
    file_path: 'banner/image1.jpg',
    image_type: 'banner',
    publicUrl: 'https://example.com/banner/image1.jpg',
    name: 'Banner Image 1',
    bucket_id: 'banner',
    uploaded_by: 'user-123',
    uploaded_at: new Date().toISOString()
  }
];

const mockGalleryImages = [
  {
    id: 'gallery-1',
    file_path: 'gallery/image1.jpg',
    image_type: 'gallery',
    publicUrl: 'https://example.com/gallery/image1.jpg',
    name: 'Gallery Image 1',
    bucket_id: 'gallery',
    uploaded_by: 'user-123',
    uploaded_at: new Date().toISOString()
  },
  {
    id: 'gallery-2',
    file_path: 'gallery/image2.jpg',
    image_type: 'gallery',
    publicUrl: 'https://example.com/gallery/image2.jpg',
    name: 'Gallery Image 2',
    bucket_id: 'gallery',
    uploaded_by: 'user-123',
    uploaded_at: new Date().toISOString()
  }
];

const mockScannerImages = [
  {
    id: 'scanner-1',
    file_path: 'scanner/image1.jpg',
    image_type: 'scanner',
    publicUrl: 'https://example.com/scanner/image1.jpg',
    name: 'Scanner Image 1',
    bucket_id: 'scanner',
    uploaded_by: 'user-123',
    uploaded_at: new Date().toISOString()
  },
  {
    id: 'scanner-2',
    file_path: 'scanner/image2.jpg',
    image_type: 'scanner',
    publicUrl: 'https://example.com/scanner/image2.jpg',
    name: 'Scanner Image 2',
    bucket_id: 'scanner',
    uploaded_by: 'user-123',
    uploaded_at: new Date().toISOString()
  }
];

// Mock data for content
const mockContent = [
  {
    id: 'what_is_comet',
    type: 'what_is_comet',
    content: 'COMET (Comprehensive Operational Medical Emergency Toolkit) is a revolutionary system designed to streamline medical emergency response in challenging environments.'
  }
];

// Mock data for templates
const mockTemplates = [
  {
    id: 'template-1',
    title: 'Basic Template',
    content: 'This is a basic template for COMET Scanner',
    created_by: 'user-123',
    created_at: new Date().toISOString()
  },
  {
    id: 'template-2',
    title: 'Advanced Template',
    content: 'This is an advanced template for COMET Scanner with more features',
    created_by: 'user-123',
    created_at: new Date().toISOString()
  }
];

// Mock data for user profiles
const mockUserProfiles = [
  {
    id: 'user-123',
    email: 'owner@example.com',
    is_owner: true,
    permissions: {
      content_management: true,
      user_management: true,
      system_configuration: true,
      media_uploads: true,
      security_settings: true,
      site_customization: true
    }
  },
  {
    id: 'user-456',
    email: 'user@example.com',
    is_owner: false,
    permissions: {
      content_management: false,
      user_management: false,
      system_configuration: false,
      media_uploads: false,
      security_settings: false,
      site_customization: false
    }
  }
];

// Define handlers
export const handlers = [
  // Handler for listing images by type
  http.get('/api/images', ({ request }) => {
    const url = new URL(request.url);
    const imageType = url.searchParams.get('type');

    if (imageType === 'banner') {
      return HttpResponse.json(mockBannerImages);
    } else if (imageType === 'gallery') {
      return HttpResponse.json(mockGalleryImages);
    } else if (imageType === 'scanner') {
      return HttpResponse.json(mockScannerImages);
    } else {
      return HttpResponse.json([...mockBannerImages, ...mockGalleryImages, ...mockScannerImages]);
    }
  }),

  // Handler for getting a specific image by ID
  http.get('/api/images/:id', ({ params }) => {
    const { id } = params;
    const allImages = [...mockBannerImages, ...mockGalleryImages, ...mockScannerImages];
    const image = allImages.find(img => img.id === id);

    if (image) {
      return HttpResponse.json(image);
    } else {
      return new HttpResponse(
        JSON.stringify({ error: 'Image not found' }),
        { status: 404 }
      );
    }
  }),

  // Handler for uploading an image
  http.post('/api/images', async ({ request }) => {
    const { type, userId } = await request.json();
    const newId = `${type}-${Date.now()}`;
    const newImage = {
      id: newId,
      file_path: `${type}/new-image.jpg`,
      image_type: type,
      publicUrl: `https://example.com/${type}/new-image.jpg`,
      name: 'New Image',
      bucket_id: type,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString()
    };

    return HttpResponse.json(newImage, { status: 201 });
  }),

  // Handler for deleting an image
  http.delete('/api/images/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ success: true, id });
  }),

  // Handler for getting content
  http.get('/api/content', ({ request }) => {
    const url = new URL(request.url);
    const contentType = url.searchParams.get('type');

    if (contentType) {
      const filteredContent = mockContent.filter(item => item.type === contentType);
      return HttpResponse.json(filteredContent);
    } else {
      return HttpResponse.json(mockContent);
    }
  }),

  // Handler for getting a specific content item by ID
  http.get('/api/content/:id', ({ params }) => {
    const { id } = params;
    const content = mockContent.find(item => item.id === id);

    if (content) {
      return HttpResponse.json(content);
    } else {
      return new HttpResponse(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404 }
      );
    }
  }),

  // Handler for updating content
  http.put('/api/content/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedData = await request.json();
    const contentIndex = mockContent.findIndex(item => item.id === id);

    if (contentIndex !== -1) {
      const updatedContent = {
        ...mockContent[contentIndex],
        ...updatedData
      };
      return HttpResponse.json(updatedContent);
    } else {
      return new HttpResponse(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404 }
      );
    }
  }),

  // Handler for getting templates
  http.get('/api/templates', () => {
    return HttpResponse.json(mockTemplates);
  }),

  // Handler for getting a specific template by ID
  http.get('/api/templates/:id', ({ params }) => {
    const { id } = params;
    const template = mockTemplates.find(item => item.id === id);

    if (template) {
      return HttpResponse.json(template);
    } else {
      return new HttpResponse(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404 }
      );
    }
  }),

  // Handler for creating a new template
  http.post('/api/templates', async ({ request }) => {
    const templateData = await request.json();
    const newTemplate = {
      id: `template-${Date.now()}`,
      ...templateData,
      created_at: new Date().toISOString()
    };

    return HttpResponse.json(newTemplate, { status: 201 });
  }),

  // Handler for getting user profiles
  http.get('/api/users', () => {
    return HttpResponse.json(mockUserProfiles);
  }),

  // Handler for getting a specific user profile by ID
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUserProfiles.find(item => item.id === id);

    if (user) {
      return HttpResponse.json(user);
    } else {
      return new HttpResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }
  }),

  // Handler for updating a user profile
  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedData = await request.json();
    const userIndex = mockUserProfiles.findIndex(item => item.id === id);

    if (userIndex !== -1) {
      const updatedUser = {
        ...mockUserProfiles[userIndex],
        ...updatedData
      };
      return HttpResponse.json(updatedUser);
    } else {
      return new HttpResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }
  })
];
