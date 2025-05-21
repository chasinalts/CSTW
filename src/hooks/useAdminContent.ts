// Hook that provides access to admin-managed content like banner images, scanner variations, and templates
import { useState, useEffect, useMemo, useCallback } from '../utils/react-imports';
import { memoize } from '../utils/memoization';
import { getPublicUrl } from '../utils/supabaseStorage'; // Import Supabase storage utility

export interface ContentItem {
  id: string;
  type: 'banner' | 'scanner' | 'gallery' | 'template' | 'question';
  title: string;
  content: string;
  fileId?: string; // Stores Appwrite File ID or Supabase public URL path
  bucketId?: string; // Stores Appwrite Bucket ID
  imagePreview?: string; // URL for local preview image during/after upload
  scale?: number;
  displayText?: string;
  isFullTemplate?: boolean;
  createdAt: number;
  updatedAt: number;
  // New properties for controlling image size
  width?: number;
  height?: number;
  aspectRatio?: string; // e.g., '16/9', '4/3', '1/1'
  displaySize?: 'small' | 'medium' | 'large' | 'custom';
  // Storage provider information
  storageProvider?: 'appwrite' | 'supabase';
}

export interface ImageContent {
  id: string;
  src: string;
  preview?: string; // URL for preview image
  alt: string;
  scale?: number;
  displayText?: string;
  // New properties for controlling image size
  width?: number;
  height?: number;
  aspectRatio?: string; // e.g., '16/9', '4/3', '1/1'
  displaySize?: 'small' | 'medium' | 'large' | 'custom';
  // Storage provider information
  storageProvider?: 'appwrite' | 'supabase';
}

export interface AdminContentHook {
  getBannerImage: () => ImageContent | null;
  getScannerImages: () => ImageContent[];
  getTemplates: () => Array<{
    id: string;
    title: string;
    code: string;
    isFullTemplate?: boolean;
  }>;
  getFullTemplate: () => {
    code: string;
    isEnabled: boolean;
  };
  getQuestions: () => Array<{
    id: string;
    title: string;
    text: string;
  }>;
  hasContent: boolean;
}

export const useAdminContent = (): AdminContentHook => {
  const [contents, setContents] = useState<ContentItem[]>([]);

  useEffect(() => {
    const loadContents = () => {
      const savedContents = localStorage.getItem('admin_contents');
      if (savedContents) {
        setContents(JSON.parse(savedContents));
      }
    };

    loadContents();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_contents') {
        loadContents();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Memoize the filter function for banner images
  const filterBanners = useMemo(() =>
    memoize((items: ContentItem[]) => items.filter(item => item.type === 'banner')),
    []
  );

  const getBannerImage = useCallback((): ImageContent | null => {
    const banners = filterBanners(contents);
    if (banners.length === 0) return null;

    const banner = banners[banners.length - 1];
    return {
      id: banner.id,
      src: (banner.storageProvider === 'appwrite' && banner.fileId && banner.bucketId)
        ? (() => {
            // For backward compatibility with Appwrite URLs
            console.log(`[useAdminContent] Using legacy URL for ${banner.fileId}`);
            return banner.fileId;
          })()
        : banner.fileId || '', // Use fileId directly (Supabase public URL)
      preview: banner.imagePreview,
      alt: banner.title,
      scale: banner.scale,
      displayText: banner.displayText,
      // Include new size properties
      width: banner.width,
      height: banner.height,
      aspectRatio: banner.aspectRatio,
      displaySize: banner.displaySize,
      // Include storage provider
      storageProvider: banner.storageProvider
    };
  }, [contents, filterBanners]);

  // Memoize the filter and transform functions for scanner images
  const filterScanners = useMemo(() =>
    memoize((items: ContentItem[]) => {
      console.log('Filtering scanner images from contents:', items.length);
      // Include both scanner type and gallery images with scanner in the title
      return items.filter(item =>
        item.type === 'scanner' ||
        (item.type === 'gallery' && item.title.toLowerCase().includes('scanner'))
      );
    }),
    []
  );

  const sortByUpdatedAt = useMemo(() =>
    memoize((items: ContentItem[]) => [...items].sort((a, b) => b.updatedAt - a.updatedAt)),
    []
  );

  const transformToImageContent = useMemo(() =>
    memoize((items: ContentItem[]): ImageContent[] =>
      items.map(item => ({
        id: item.id,
        src: (item.storageProvider === 'appwrite' && item.fileId && item.bucketId)
          ? (() => {
              // For backward compatibility with Appwrite URLs
              console.log(`[useAdminContent] Using legacy URL for ${item.fileId}`);
              return item.fileId;
            })()
          : item.fileId || '', // Use fileId directly (Supabase public URL)
        preview: item.imagePreview,
        alt: item.title,
        scale: item.scale,
        displayText: item.displayText,
        // Include new size properties
        width: item.width,
        height: item.height,
        aspectRatio: item.aspectRatio,
        displaySize: item.displaySize,
        // Include storage provider
        storageProvider: item.storageProvider
      }))
    ),
    []
  );

  const getScannerImages = useCallback((): ImageContent[] => {
    console.log('Getting scanner images from contents:', contents.length);
    const filtered = filterScanners(contents);
    console.log('Filtered scanner images:', filtered.length);
    const sorted = sortByUpdatedAt(filtered);
    const result = transformToImageContent(sorted);
    console.log('Transformed scanner images:', result.length);
    return result;
  }, [contents, filterScanners, sortByUpdatedAt, transformToImageContent]);

  // Memoize the filter and transform functions for templates
  const filterTemplates = useMemo(() =>
    memoize((items: ContentItem[]) => items.filter(item => item.type === 'template')),
    []
  );

  const transformToTemplates = useMemo(() =>
    memoize((items: ContentItem[]) =>
      items.map(item => ({
        id: item.id,
        title: item.title,
        code: item.content,
        isFullTemplate: item.isFullTemplate
      }))
    ),
    []
  );

  const getTemplates = useCallback(() => {
    const filtered = filterTemplates(contents);
    const sorted = sortByUpdatedAt(filtered);
    return transformToTemplates(sorted);
  }, [contents, filterTemplates, sortByUpdatedAt, transformToTemplates]);

  // Get the full template code from localStorage
  const getFullTemplate = useCallback(() => {
    return {
      code: localStorage.getItem('fullTemplateCode') || '',
      isEnabled: localStorage.getItem('fullTemplateEnabled') === 'true'
    };
  }, []);

  // Memoize the filter and transform functions for questions
  const filterQuestions = useMemo(() =>
    memoize((items: ContentItem[]) => items.filter(item => item.type === 'question')),
    []
  );

  const transformToQuestions = useMemo(() =>
    memoize((items: ContentItem[]) =>
      items.map(item => ({
        id: item.id,
        title: item.title,
        text: item.content
      }))
    ),
    []
  );

  const getQuestions = useCallback(() => {
    const filtered = filterQuestions(contents);
    const sorted = sortByUpdatedAt(filtered);
    return transformToQuestions(sorted);
  }, [contents, filterQuestions, sortByUpdatedAt, transformToQuestions]);

  // Memoize the final result to prevent unnecessary re-renders
  const result = useMemo(() => ({
    getBannerImage,
    getScannerImages,
    getTemplates,
    getFullTemplate,
    getQuestions,
    hasContent: contents.length > 0
  }), [getBannerImage, getScannerImages, getTemplates, getFullTemplate, getQuestions, contents.length]);

  return result;
};

export default useAdminContent;