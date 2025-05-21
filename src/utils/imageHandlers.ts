import { processImageForUpload } from './imageCompression';
// Removed uploadFile, deleteFile imports as they are replaced by fetch calls
import { getUserId } from './storage'; // Corrected import path
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles image upload using local storage (base64 encoding)
 * @deprecated Use handleSupabaseImageUpload instead for better performance
 */
export const handleLocalImageUpload = (
  file: File,
  onSuccess: (imageUrl: string, imagePreview: string) => void
) => {
  const imagePreview = URL.createObjectURL(file);
  const reader = new FileReader();

  reader.onloadend = () => {
    const imageUrl = reader.result as string;
    console.log('Image uploaded locally:', { file, imageUrl: imageUrl.substring(0, 50) + '...', imagePreview });
    onSuccess(imageUrl, imagePreview);
  };

  reader.readAsDataURL(file);
};

/**
 * Handles image upload using Netlify Blobs and Turso
 * @param file The file to upload
 * @param type The type of image (banner, scanner, etc.)
 * @param onSuccess Callback function to be called when upload is successful
 * @param onError Optional callback function to be called when upload fails
 */
export const handleTursoImageUpload = (
  file: File,
  type: string,
  onSuccess: (imageUrl: string, imagePreview: string) => void,
  onError?: (error: any) => void
) => {
  try {
    // Create a temporary preview URL for immediate display
    const imagePreview = URL.createObjectURL(file);

    // Process the image in a non-blocking way
    // Helper function to read file as base64
    const readFileAsBase64 = (inputFile: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string)?.split(',')[1];
                if (base64String) {
                    resolve(base64String);
                } else {
                    reject(new Error("Failed to read file as base64."));
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(inputFile);
        });
    };

    (async () => {
      try {
        // Process and compress the image if needed
        const processedFile = await processImageForUpload(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          maxSizeInMB: 1 // Ensure this limit is reasonable for base64 encoding + JSON overhead
        });

        // Map scanner type to gallery folder since they are the same
        const storagePath = type === 'scanner' ? 'gallery' : type;
        console.log(`Uploading ${type} image to ${storagePath} folder via Netlify Function`);

        // --- Prepare data for Netlify Function ---
        const userId = getUserId();
        if (!userId) {
          throw new Error("User not authenticated for upload.");
        }

        const fileExt = processedFile.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExt}`;
        const blobKey = `${storagePath}/${uniqueFileName}`; // e.g., gallery/uuid.jpg

        const base64Value = await readFileAsBase64(processedFile);

        const requestBody = {
            action: 'set',
            key: blobKey,
            value: base64Value,
            contentType: processedFile.type,
            metadata: {
                userId: userId,
                originalName: file.name, // Original file name
                path: storagePath,       // The 'folder'
                type: type,              // The logical type ('banner', 'gallery')
                size: processedFile.size,
                // Add uploadedAt here if needed, or let the function handle it
                uploadedAt: new Date().toISOString()
            }
        };
        // --- End Prepare data ---

        // --- Call Netlify Function ---
        const response = await fetch('/.netlify/functions/blob-handler.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            let errorMsg = `Upload failed: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg += ` - ${errorData?.error || 'Unknown server error'}`;
            } catch (e) { /* Ignore parsing error */ }
            throw new Error(errorMsg);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(`Upload failed: ${result.error || 'Function returned failure'}`);
        }
        // --- End Call Netlify Function ---

        const { url: uploadedUrl, imageId } = result; // Get URL and imageId from response

        console.log('Image uploaded successfully via Netlify Function:', {
          originalSize: file.size,
          processedSize: processedFile.size,
          compressionRatio: ((processedFile.size / file.size) * 100).toFixed(2) + '%',
          imageUrl: uploadedUrl,
          imageId: imageId
        });

        // Call the success callback with the URL, preview URL, and potentially imageId
        // Adjust onSuccess signature if imageId is needed downstream:
        // onSuccess: (imageUrl: string, imagePreview: string, imageId?: string) => void
        onSuccess(uploadedUrl, imagePreview /*, imageId */);

        // Clean up the preview URL after a delay to ensure it's used
        setTimeout(() => {
          URL.revokeObjectURL(imagePreview);
        }, 5000); // Keep delay or adjust as needed

      } catch (error) {
        console.error('Error in image processing or upload via Netlify Function:', error);

        // Clean up the preview URL
        URL.revokeObjectURL(imagePreview);

        // Call the error callback if provided
        if (onError) {
          onError(error);
        } else {
          throw error;
        }
      }
    })();
  } catch (error) {
    console.error('Error in handleTursoImageUpload:', error);
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
  }
};

/**
 * Handles image upload using our unified storage system
 * @param file The file to upload
 * @param type The type of image (banner, scanner, etc.)
 * @param onSuccess Callback function to be called when upload is successful
 * @param onError Optional callback function to be called when upload fails
 */
export const handleImageUpload = (
  file: File,
  type: string,
  onSuccess: (imageUrl: string, imagePreview: string) => void,
  onError?: (error: any) => void
) => {
  // Use Turso and Netlify Blobs for storage
  return handleTursoImageUpload(file, type, onSuccess, onError);
};

/**
 * Cleans up a URL, revoking object URLs if necessary
 * @param url The URL to clean up
 * @param isCloudUrl Whether the URL is from a cloud storage provider
 * @param fileId Optional file ID for deleting from storage
 */
export const cleanupImageUrl = async (url: string, isCloudUrl = false, fileId?: string) => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  } else if (isCloudUrl && fileId) {
    try {
      // Delete the file using the Netlify function
      console.log(`Attempting to delete image with ID: ${fileId} via Netlify Function`);
      const response = await fetch(`/.netlify/functions/blob-handler.js?action=delete&key=${encodeURIComponent(fileId)}`, {
          method: 'DELETE',
      });

      if (!response.ok) {
          let errorMsg = `Failed to delete image ${fileId}: ${response.status} ${response.statusText}`;
          try {
              const errorData = await response.json();
              errorMsg += ` - ${errorData?.error || 'Unknown server error'}`;
          } catch (e) { /* Ignore parsing error */ }
          console.error(errorMsg);
          // Decide if this should throw or just log
      } else {
          const result = await response.json();
          if (!result.success) {
               console.error(`Failed to delete image ${fileId}: ${result.error || 'Function returned failure'}`);
               // Decide if this should throw or just log
          } else {
              console.log(`Image ${fileId} deleted successfully via function.`);
          }
      }
    } catch (error) {
      console.error('Error during fetch call for image deletion:', error);
    }
  }
};

/**
 * Resizes an image to the specified dimensions
 * @param file The image file to resize
 * @param maxWidth Maximum width of the resized image
 * @param maxHeight Maximum height of the resized image
 * @returns A promise that resolves to a Blob of the resized image
 */
export const resizeImage = (
  file: Blob,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
      let width = image.width;
      let height = image.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not create blob from canvas'));
        }
      }, file.type);

      URL.revokeObjectURL(image.src);
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(image.src);
    };
  });
};
