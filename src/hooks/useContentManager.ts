// Hook that manages content creation, updating, and deletion, including image uploads and size adjustments
import { useState, useEffect, useCallback } from '../utils/react-imports';
import type { ContentItem } from './useAdminContent';
import { handleImageUpload, cleanupImageUrl } from '../utils/imageHandlers';
import { BucketType as SupabaseBucketType } from '../utils/supabaseStorage';
import { useAuth0Context } from '../contexts/Auth0Context';

export interface ContentManagerHook {
  contents: ContentItem[];
  addContent: (content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateContent: (id: string, updates: Partial<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteContent: (id: string) => void;
  uploadImage: (file: File, type: 'banner' | 'scanner' | 'gallery', title?: string) => Promise<string>;
  updateImageScale: (id: string, scale: number) => void;
  updateImageDisplayText: (id: string, displayText: string) => void;
  updateImageSize: (id: string, width?: number, height?: number) => void;
  updateImageAspectRatio: (id: string, aspectRatio: string) => void;
  updateImageDisplaySize: (id: string, displaySize: 'small' | 'medium' | 'large' | 'custom') => void;
}

export const useContentManager = (): ContentManagerHook => {
  const { currentUser } = useAuth0Context();
  const [contents, setContents] = useState<ContentItem[]>(() => {
    const savedContents = localStorage.getItem('admin_contents');
    return savedContents ? JSON.parse(savedContents) : [];
  });

  // Save contents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('admin_contents', JSON.stringify(contents));
    console.log('Contents saved to localStorage:', contents);
  }, [contents]);

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      contents.forEach((content: ContentItem) => {
        if (content.fileId && content.storageProvider === 'supabase') { 
            const isCloudUrl = content.fileId.includes('supabase'); 
            cleanupImageUrl(content.fileId, isCloudUrl, content.type as SupabaseBucketType, content.storageProvider);
        } else if (content.imagePreview && content.imagePreview.startsWith('blob:')) {
            // Cleanup local blob previews if they weren't cleaned up elsewhere
            cleanupImageUrl(content.imagePreview, false);
        }
      });
    };
  }, []);

  const addContent = useCallback((content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `content-${Date.now()}`;
    const timestamp = Date.now();

    const newContent: ContentItem = {
      ...content,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setContents((prev: ContentItem[]) => [...prev, newContent]);
    return id;
  }, []);

  const updateContent = useCallback((id: string, updates: Partial<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setContents((prev: ContentItem[]) =>
      prev.map((item: ContentItem) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: Date.now() }
          : item
      )
    );
  }, []);

  const deleteContent = useCallback((id: string) => {
    setContents((prev: ContentItem[]) => {
      const contentToDelete = prev.find((item: ContentItem) => item.id === id);

      // Cleanup image URL if it exists
      if (contentToDelete?.fileId && contentToDelete.storageProvider === 'supabase') {
        const isCloudUrl = contentToDelete.fileId.includes('supabase');
        const bucketType = contentToDelete.type as SupabaseBucketType;

        // Clean up the image file from storage
        cleanupImageUrl(contentToDelete.fileId, isCloudUrl, bucketType, contentToDelete.storageProvider);
      }
      // Also cleanup local blob preview if it exists and wasn't cleaned up
      if (contentToDelete?.imagePreview && contentToDelete.imagePreview.startsWith('blob:')) {
        cleanupImageUrl(contentToDelete.imagePreview, false);
      }

      return prev.filter((item: ContentItem) => item.id !== id);
    });
  }, []);

  const uploadImage = useCallback((
    file: File,
    type: 'banner' | 'scanner' | 'gallery',
    title = 'Uploaded Image',
    storageProvider: 'supabase' = 'supabase'
  ): Promise<string> => {
    console.log(`Starting upload of ${type} image:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storageProvider
    });

    return new Promise((resolve, reject) => {
      try {
        // Get the current user ID for the upload
        const userId = currentUser?.id || 'system';

        // Use the specified storage provider for image uploads
        handleImageUpload(
          file,
          type,
          (imageUrl: string, imagePreview: string) => {
            try {
              console.log(`Adding ${type} content with ${storageProvider} Storage URL`);
              const id = addContent({
                type,
                title,
                content: '',
                fileId: imageUrl, 
                imagePreview, // This is the local blob or result.file.url
                scale: 1,
                storageProvider
              });
              console.log(`${type} image added with ID:`, id);
              resolve(id);
            } catch (innerError: any) {
              console.error(`Error adding ${type} content:`, innerError);
              reject(innerError);
            }
          },
          (error: any) => {
            console.error(`Error uploading ${type} image to ${storageProvider} Storage:`, error);
            reject(new Error(`Failed to upload to ${storageProvider} Storage: ${error instanceof Error ? error.message : 'Unknown error'}`));
          },
          userId, // Pass the user ID to the upload function
          storageProvider // Pass the storage provider to the upload function
        );
      } catch (error: any) {
        console.error(`Error setting up ${type} image upload:`, error);
        reject(error);
      }
    });
  }, [addContent, currentUser]);

  const updateImageScale = useCallback((id: string, scale: number) => {
    updateContent(id, { scale });

    // Trigger a custom event to notify other components about the scale change
    const event = new CustomEvent('image-scale-changed', {
      detail: { id, scale }
    });
    window.dispatchEvent(event);

    console.log('Image scale updated and event dispatched:', { id, scale });
  }, [updateContent]);

  const updateImageDisplayText = useCallback((id: string, displayText: string) => {
    updateContent(id, { displayText });
  }, [updateContent]);

  // New functions for updating image size properties
  const updateImageSize = useCallback((id: string, width?: number, height?: number) => {
    updateContent(id, { width, height });

    // Trigger a custom event to notify other components about the size change
    const event = new CustomEvent('image-size-changed', {
      detail: { id, width, height }
    });
    window.dispatchEvent(event);

    console.log('Image size updated and event dispatched:', { id, width, height });
  }, [updateContent]);

  const updateImageAspectRatio = useCallback((id: string, aspectRatio: string) => {
    updateContent(id, { aspectRatio });

    // Trigger a custom event to notify other components about the aspect ratio change
    const event = new CustomEvent('image-aspect-ratio-changed', {
      detail: { id, aspectRatio }
    });
    window.dispatchEvent(event);

    console.log('Image aspect ratio updated and event dispatched:', { id, aspectRatio });
  }, [updateContent]);

  const updateImageDisplaySize = useCallback((id: string, displaySize: 'small' | 'medium' | 'large' | 'custom') => {
    updateContent(id, { displaySize });

    // Trigger a custom event to notify other components about the display size change
    const event = new CustomEvent('image-display-size-changed', {
      detail: { id, displaySize }
    });
    window.dispatchEvent(event);

    console.log('Image display size updated and event dispatched:', { id, displaySize });
  }, [updateContent]);

  return {
    contents,
    addContent,
    updateContent,
    deleteContent,
    uploadImage,
    updateImageScale,
    updateImageDisplayText,
    updateImageSize,
    updateImageAspectRatio,
    updateImageDisplaySize
  };
};

export default useContentManager;
