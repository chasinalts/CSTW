/**
 * Utility functions for image compression
 */

/**
 * Compresses an image file to reduce its size
 * @param file The image file to compress
 * @param maxWidth Maximum width of the compressed image
 * @param maxHeight Maximum height of the compressed image
 * @param quality Compression quality (0-1)
 * @returns A promise that resolves to a compressed File object
 */
export const compressImage = async (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          // Create canvas and resize image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob and create new file
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob from canvas'));
                return;
              }

              const compressedFile = new File(
                [blob],
                file.name,
                {
                  type: file.type,
                  lastModified: Date.now()
                }
              );

              // Log compression results
              console.log('Image compression:', {
                originalSize: file.size,
                compressedSize: compressedFile.size,
                ratio: `${(compressedFile.size / file.size * 100).toFixed(0)}%`,
                dimensions: `${width}x${height}`
              });

              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));

        if (typeof event.target?.result === 'string') {
          img.src = event.target.result;
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Processes an image file, applying compression if needed
 * @param file The image file to process
 * @param options Compression options
 * @returns A promise that resolves to a processed File object
 */
export const processImageForUpload = async (
  file: File,
  options = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    maxSizeInMB: 1
  }
): Promise<File> => {
  try {
    // Determine if compression is needed based on file size
    const maxSizeInBytes = options.maxSizeInMB * 1024 * 1024;
    const needsCompression = file.size > maxSizeInBytes;

    // Use appropriate quality setting
    const quality = needsCompression ? options.quality : 0.92;

    return await compressImage(
      file,
      options.maxWidth,
      options.maxHeight,
      quality
    );
  } catch (error) {
    console.error('Error processing image, using original:', error);
    return file; // Fallback to original file
  }
};
