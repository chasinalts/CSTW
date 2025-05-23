import { vi } from 'vitest';

// Mock URL methods
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
global.URL.revokeObjectURL = vi.fn();

// Mock canvas and context
const mockContext = {
  drawImage: vi.fn(),
  canvas: {
    toBlob: vi.fn().mockImplementation((callback, type, quality) => {
      // Create a mock blob with size proportional to quality
      const size = Math.floor(1024 * (quality || 0.8));
      callback(new Blob(['x'.repeat(size)], { type: type || 'image/jpeg' }));
    }),
    toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,test'),
  },
};

// Mock document.createElement to return our mock canvas
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName) => {
  if (tagName === 'canvas') {
    return {
      getContext: () => mockContext,
      width: 0,
      height: 0,
      toBlob: vi.fn().mockImplementation((callback, type, quality) => {
        const size = Math.floor(1024 * (quality || 0.8));
        callback(new Blob(['x'.repeat(size)], { type: type || 'image/jpeg' }));
      }),
    };
  }
  return originalCreateElement.call(document, tagName);
});

// Mock Image
const mockImage = {
  width: 1920,
  height: 1080,
  onload: null,
  src: '',
};

global.Image = vi.fn().mockImplementation(() => {
  const img = { ...mockImage };
  setTimeout(() => img.onload && img.onload());
  return img;
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}

global.ResizeObserver = MockResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock framer-motion
vi.mock('framer-motion', () => {
  const actual = vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      span: ({ children, ...props }) => <span {...props}>{children}</span>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      img: ({ children, ...props }) => <img {...props}>{children}</img>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    useScroll: () => ({ scrollYProgress: { onChange: vi.fn(), current: 0 } }),
    useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
    useTransform: () => ({ get: () => 0, set: vi.fn() }),
    useReducedMotion: () => false,
  };
});

// Mock Supabase storage functions
vi.mock('../utils/supabaseImageStorage', () => ({
  uploadFile: vi.fn().mockImplementation((file, bucketType, userId) => {
    return Promise.resolve({
      $id: `${bucketType}-${Date.now()}`,
      bucketId: bucketType,
      filePath: `${bucketType}/${file.name}`,
      publicUrl: `https://example.com/${bucketType}/${file.name}`,
      name: file.name,
      size: file.size,
    });
  }),
  getFileUrl: vi.fn().mockImplementation((filePath, bucketType) => {
    return `https://example.com/${bucketType}/${filePath}`;
  }),
  listFiles: vi.fn().mockImplementation((bucketType) => {
    return Promise.resolve([
      {
        id: `${bucketType}-1`,
        file_path: `${bucketType}/image1.jpg`,
        image_type: bucketType,
        publicUrl: `https://example.com/${bucketType}/image1.jpg`,
      },
      {
        id: `${bucketType}-2`,
        file_path: `${bucketType}/image2.jpg`,
        image_type: bucketType,
        publicUrl: `https://example.com/${bucketType}/image2.jpg`,
      },
    ]);
  }),
  deleteFile: vi.fn().mockResolvedValue(true),
  getFilePreview: vi.fn().mockImplementation((fileId, bucketType) => {
    return Promise.resolve(`https://example.com/${bucketType}/preview/${fileId}.jpg`);
  }),
  getBucketId: vi.fn().mockImplementation((bucketType) => bucketType),
}));

// Mock Appwrite storage functions
vi.mock('../utils/appwriteStorage', () => ({
  uploadFile: vi.fn().mockImplementation((file, bucketType, userId) => {
    return Promise.resolve({
      file: {
        $id: `${bucketType}-${Date.now()}`,
        name: file.name,
        mimeType: file.type,
        sizeOriginal: file.size,
      },
      metadata: {
        $id: `metadata-${Date.now()}`,
        name: file.name,
        file_id: `${bucketType}-${Date.now()}`,
        bucket_id: bucketType,
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
        image_type: bucketType,
      },
    });
  }),
  getFilePreview: vi.fn().mockImplementation((fileId, bucketType) => {
    return `https://example.com/${bucketType}/preview/${fileId}.jpg`;
  }),
  listFiles: vi.fn().mockImplementation((bucketType) => {
    return Promise.resolve({
      files: [
        {
          $id: `${bucketType}-1`,
          name: `${bucketType}1.jpg`,
          mimeType: 'image/jpeg',
        },
        {
          $id: `${bucketType}-2`,
          name: `${bucketType}2.jpg`,
          mimeType: 'image/jpeg',
        },
      ],
      metadata: [
        {
          $id: `metadata-1`,
          file_id: `${bucketType}-1`,
          image_type: bucketType,
        },
        {
          $id: `metadata-2`,
          file_id: `${bucketType}-2`,
          image_type: bucketType,
        },
      ],
    });
  }),
  deleteFile: vi.fn().mockResolvedValue(true),
  getBucketId: vi.fn().mockImplementation((bucketType) => bucketType),
}));

// Mock database service
vi.mock('../utils/databaseService', () => ({
  databaseService: {
    create: vi.fn().mockImplementation((collection, data, id) => {
      return Promise.resolve({
        id: id || `${collection}-${Date.now()}`,
        ...data,
      });
    }),
    get: vi.fn().mockImplementation((collection, id) => {
      return Promise.resolve({
        id,
        name: `${collection} item`,
        type: collection === 'content' ? 'what_is_comet' : undefined,
        content: collection === 'content' ? 'Test COMET description' : undefined,
      });
    }),
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
      } else if (collection === 'user_profiles') {
        return Promise.resolve([
          { id: 'user-1', email: 'user1@example.com', is_owner: false },
          { id: 'user-2', email: 'user2@example.com', is_owner: false },
        ]);
      } else if (collection === 'images') {
        const filterType = filters?.find(f => f.key === 'image_type')?.value;
        return Promise.resolve([
          {
            id: `${filterType || 'image'}-1`,
            file_path: `${filterType || 'image'}/image1.jpg`,
            image_type: filterType || 'image',
          },
          {
            id: `${filterType || 'image'}-2`,
            file_path: `${filterType || 'image'}/image2.jpg`,
            image_type: filterType || 'image',
          },
        ]);
      }
      return Promise.resolve([]);
    }),
    update: vi.fn().mockImplementation((collection, id, data) => {
      return Promise.resolve({
        id,
        ...data,
      });
    }),
    delete: vi.fn().mockResolvedValue(true),
  },
}));

// Mock image handlers
vi.mock('../utils/imageHandlers', () => ({
  handleImageUpload: vi.fn().mockImplementation((file, type, onSuccess) => {
    // Simulate successful upload
    const imageId = `${type}-${Date.now()}`;
    const imageUrl = `https://example.com/${type}/${imageId}.jpg`;
    onSuccess(imageId, imageUrl);
    return Promise.resolve();
  }),
  handleAppwriteImageUpload: vi.fn().mockImplementation((file, type, onSuccess) => {
    const imageId = `${type}-${Date.now()}`;
    const imageUrl = `https://example.com/${type}/${imageId}.jpg`;
    onSuccess(imageId, imageUrl);
    return Promise.resolve();
  }),
  handleSupabaseImageUpload: vi.fn().mockImplementation((file, type, onSuccess) => {
    const imageId = `${type}-${Date.now()}`;
    const imageUrl = `https://example.com/${type}/${imageId}.jpg`;
    onSuccess(imageId, imageUrl);
    return Promise.resolve();
  }),
  resizeImage: vi.fn().mockImplementation((src, options) => {
    return Promise.resolve({
      src,
      width: options?.width || 800,
      height: options?.height || 600,
    });
  }),
}));

// Mock image compression
vi.mock('../utils/imageCompression', () => ({
  processImageForUpload: vi.fn().mockImplementation((file, options) => {
    return Promise.resolve(file);
  }),
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
}));

// Mock HolographicText component
vi.mock('../components/ui/HolographicText', () => ({
  default: ({ children }) => <div data-testid="holographic-text">{children}</div>,
}));

// Mock LazyImage component
vi.mock('../components/ui/LazyImage', () => ({
  default: ({ src, alt, className, onClick, scale, gallerySize }) => (
    <div data-testid="lazy-image-container">
      <img 
        data-testid="lazy-image" 
        src={src} 
        alt={alt} 
        className={className} 
        onClick={onClick} 
        style={{ transform: scale ? `scale(${scale})` : undefined }}
      />
      {gallerySize && <div data-testid="gallery-controls"></div>}
    </div>
  ),
}));

// Mock Button component
vi.mock('../components/ui/Button', () => ({
  default: ({ children, onClick, disabled }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
