// Setup file for Vitest tests
import { vi, beforeAll, afterEach, afterAll, expect } from 'vitest';
import '@testing-library/jest-dom';
import { server } from './mocks/server';
import '@testing-library/jest-dom';
import { setupSupabaseMock } from './__tests__/mocks/supabaseMock';
import { setupAppwriteMock } from './__tests__/mocks/appwriteMock';
import React from 'react';
import { cleanup } from '@testing-library/react';
import { configure } from '@testing-library/dom';
import { TextEncoder, TextDecoder } from 'util';

// Fix for TextEncoder/TextDecoder not being available in JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Fix for JSDOM not supporting certain DOM features
class MockPointerEvent extends Event {
  constructor(type, props) {
    super(type, props);
    this.pageX = props?.pageX || 0;
    this.pageY = props?.pageY || 0;
    this.clientX = props?.clientX || 0;
    this.clientY = props?.clientY || 0;
  }
}

// Add PointerEvent to global if it doesn't exist
if (!global.PointerEvent) {
  global.PointerEvent = MockPointerEvent;
}

// Fix for missing ResizeObserver in JSDOM
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add ResizeObserver to global if it doesn't exist
if (!global.ResizeObserver) {
  global.ResizeObserver = ResizeObserver;
}

// Fix for missing IntersectionObserver in JSDOM
class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add IntersectionObserver to global if it doesn't exist
if (!global.IntersectionObserver) {
  global.IntersectionObserver = IntersectionObserver;
}

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  // Increase timeout for async operations
  asyncUtilTimeout: 5000,
});

// Establish API mocking before all tests
beforeAll(() => {
  // Setup MSW server
  server.listen({ onUnhandledRequest: 'warn' });

  // Setup Supabase and Appwrite mocks
  setupSupabaseMock();
  setupAppwriteMock();

  // Setup Canvas mock for JSDOM
  setupCanvasMock();

  // Setup React component mocks
  setupReactComponentMocks();
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
  cleanup(); // Clean up React Testing Library's DOM

  // Reset any mocks that might have been modified during tests
  vi.clearAllMocks();
});

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock the import.meta.env values
vi.stubGlobal('import.meta', {
  env: {
    VITE_APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1',
    VITE_APPWRITE_PROJECT_ID: 'test-project',
    VITE_APPWRITE_DATABASE_ID: 'test-database',
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_APPWRITE_IMAGES_BUCKET_ID: 'banner',
    VITE_APPWRITE_BANNER_BUCKET_ID: 'banner',
    VITE_APPWRITE_GALLERY_BUCKET_ID: 'gallery',
    VITE_APPWRITE_SCANNER_BUCKET_ID: 'scanner',
    VITE_SUPABASE_BANNER_BUCKET: 'banner',
    VITE_SUPABASE_GALLERY_BUCKET: 'gallery',
    VITE_SUPABASE_SCANNER_BUCKET: 'scanner',
    MODE: 'test',
    DEV: true,
  },
});

// Setup React component mocks
function setupReactComponentMocks() {
  // Mock framer-motion
  vi.mock('framer-motion', () => {
    return {
      motion: {
        div: ({ children, ...props }) => React.createElement('div', props, children),
        span: ({ children, ...props }) => React.createElement('span', props, children),
        button: ({ children, ...props }) => React.createElement('button', props, children),
        img: ({ children, ...props }) => React.createElement('img', props, children),
        section: ({ children, ...props }) => React.createElement('section', props, children),
        article: ({ children, ...props }) => React.createElement('article', props, children),
        nav: ({ children, ...props }) => React.createElement('nav', props, children),
        header: ({ children, ...props }) => React.createElement('header', props, children),
        footer: ({ children, ...props }) => React.createElement('footer', props, children),
        main: ({ children, ...props }) => React.createElement('main', props, children),
        aside: ({ children, ...props }) => React.createElement('aside', props, children),
        ul: ({ children, ...props }) => React.createElement('ul', props, children),
        li: ({ children, ...props }) => React.createElement('li', props, children),
        form: ({ children, ...props }) => React.createElement('form', props, children),
        input: (props) => React.createElement('input', props),
        textarea: (props) => React.createElement('textarea', props),
        select: ({ children, ...props }) => React.createElement('select', props, children),
        option: ({ children, ...props }) => React.createElement('option', props, children),
        label: ({ children, ...props }) => React.createElement('label', props, children),
        h1: ({ children, ...props }) => React.createElement('h1', props, children),
        h2: ({ children, ...props }) => React.createElement('h2', props, children),
        h3: ({ children, ...props }) => React.createElement('h3', props, children),
        h4: ({ children, ...props }) => React.createElement('h4', props, children),
        h5: ({ children, ...props }) => React.createElement('h5', props, children),
        h6: ({ children, ...props }) => React.createElement('h6', props, children),
        p: ({ children, ...props }) => React.createElement('p', props, children),
      },
      AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
      useScroll: () => ({ scrollYProgress: { onChange: vi.fn(), current: 0 } }),
      useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
      useTransform: () => ({ get: () => 0, set: vi.fn() }),
      useReducedMotion: () => false,
      Reorder: {
        Group: ({ children, ...props }) => React.createElement('div', props, children),
        Item: ({ children, ...props }) => React.createElement('div', props, children),
      },
    };
  });

  // Mock HolographicText component
  vi.mock('./components/ui/HolographicText', () => ({
    default: ({ children, text, ...props }) => React.createElement('div', {
      'data-testid': 'holographic-text',
      ...props
    }, text || children),
  }));

  // Mock LazyImage component
  vi.mock('./components/ui/LazyImage', () => ({
    default: ({ src, alt, className, onClick, scale, gallerySize, ...props }) =>
      React.createElement('div', { 'data-testid': 'lazy-image-container' }, [
        React.createElement('img', {
          'data-testid': 'lazy-image',
          src,
          alt,
          className,
          onClick,
          style: { transform: scale ? `scale(${scale})` : undefined },
          ...props
        }),
        gallerySize && React.createElement('div', { 'data-testid': 'gallery-controls' })
      ])
  }));

  // Mock Button component
  vi.mock('./components/ui/Button', () => ({
    default: ({ children, onClick, disabled, ...props }) =>
      React.createElement('button', {
        'data-testid': 'button',
        onClick,
        disabled,
        ...props
      }, children),
  }));
}

// Setup Canvas mock for JSDOM
function setupCanvasMock() {
  // Mock canvas and context
  const mockContext = {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
    })),
    setTransform: vi.fn(),
    transform: vi.fn(),
    scale: vi.fn(),
    measureText: vi.fn(() => ({
      width: 10,
      height: 10,
    })),
    fillText: vi.fn(),
  };

  // Create a proper mock for HTMLCanvasElement
  class MockCanvas {
    width = 0;
    height = 0;

    getContext() {
      return mockContext;
    }

    toBlob(callback, type, quality) {
      try {
        const size = Math.floor(1024 * (quality || 0.8));
        const blob = new Blob(['x'.repeat(size)], { type: type || 'image/jpeg' });
        setTimeout(() => callback(blob), 0);
      } catch (error) {
        console.error('Error in toBlob mock:', error);
        setTimeout(() => callback(null), 0);
      }
    }

    toDataURL() {
      return 'data:image/jpeg;base64,test';
    }
  }

  // Override the HTMLCanvasElement prototype
  const originalCreateElement = document.createElement;

  // Mock document.createElement
  document.createElement = vi.fn().mockImplementation((tagName) => {
    if (tagName.toLowerCase() === 'canvas') {
      return new MockCanvas();
    }
    return originalCreateElement.call(document, tagName);
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
    setTimeout(() => img.onload && img.onload());
    return img;
  });

  // Mock URL methods
  // Define URL methods if they don't exist
  if (!global.URL) {
    global.URL = {
      createObjectURL: vi.fn().mockReturnValue('blob:test-url'),
      revokeObjectURL: vi.fn()
    } as any;
  } else {
    // If URL exists but methods don't, add them
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn();
    }
  }
}
