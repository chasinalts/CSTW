// Lazy-loading image component that handles responsive images, scaling, and size controls
import React from 'react';
import { useState, useEffect, useCallback } from '../../utils/react-imports';
import { useLazyLoading } from '../../hooks/useLazyLoading';
import { resizeImage } from '../../utils/imageHandlers';
import { getFilePreview } from '../../utils/supabaseStorage';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderColor?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  gallerySize?: boolean;
  sizes?: string;
  loadingStrategy?: 'lazy' | 'eager';
  scale?: number; // Added scale property
  // New size control properties
  aspectRatio?: string; // e.g., '16/9', '4/3', '1/1'
  displaySize?: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: number;
  customHeight?: number;
}

/**
 * A component that lazily loads images when they enter the viewport
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderColor = '#f3f4f6',
  style = {},
  onClick,
  gallerySize = false,
  sizes = '100vw',
  loadingStrategy = 'lazy',
  scale = 1, // Default scale to 1
  // New size control properties with defaults
  aspectRatio,
  displaySize = 'medium',
  customWidth,
  customHeight
}) => {
  // State for tracking image loading
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Calculate image dimensions based on displaySize
  const getImageDimensions = useCallback(() => {
    // If custom dimensions are provided, use those
    if (customWidth && customHeight) {
      return { width: customWidth, height: customHeight };
    }

    // If width and height are provided directly, use those
    if (width && height) {
      return { width, height };
    }

    // If aspect ratio is provided, use it with a base width
    if (aspectRatio) {
      const [widthRatio, heightRatio] = aspectRatio.split('/').map(Number);
      const baseWidth = 640; // Medium size base width
      const calculatedHeight = (baseWidth * heightRatio) / widthRatio;
      return { width: baseWidth, height: calculatedHeight };
    }

    // Otherwise, use displaySize to determine dimensions
    switch (displaySize) {
      case 'small':
        return { width: 320, height: 180 }; // 16:9 aspect ratio
      case 'medium':
        return { width: 640, height: 360 }; // 16:9 aspect ratio
      case 'large':
        return { width: 960, height: 540 }; // 16:9 aspect ratio
      default:
        return { width: 640, height: 360 }; // Default to medium
    }
  }, [customWidth, customHeight, width, height, displaySize, aspectRatio]);

  // Calculate dimensions
  const dimensions = getImageDimensions();

  // Use lazy loading hook with different margins based on loading strategy
  const { ref, isVisible } = useLazyLoading<HTMLDivElement>({
    rootMargin: loadingStrategy === 'eager' ? '400px' : '200px',
    threshold: 0,
    triggerOnce: true
  });

  // Check if this is a Firebase Storage URL
  const isFirebaseUrl = src.includes('firebasestorage.googleapis.com');



  // Check if this is a Supabase Storage URL
  const isSupabaseUrl = src.includes('supabase.co') || src.includes('supabase.in');

  // Load image when it becomes visible
  useEffect(() => {
    // Skip if not visible yet or already loaded/errored
    if (!isVisible) return;

    let isMounted = true;
    let objectUrl: string | null = null;

    // Set a timeout to show loading state if image takes too long
    const loadingTimeout = setTimeout(() => {
      if (isMounted && !imageSrc && !error) {
        console.log('Image loading taking longer than expected:', src);
      }
    }, 3000);

    const loadImage = async () => {
      try {
        // For Firebase Storage URLs, we can use them directly without additional processing
        if (isFirebaseUrl && !gallerySize) {
          setImageSrc(src);
          setIsLoaded(true);
          return;
        }

        // For Supabase Storage URLs, use them directly
        if (isSupabaseUrl) {
          console.log('Processing Supabase URL:', src);
          setImageSrc(src);
          if (!gallerySize) {
            setIsLoaded(true);
            return;
          }
        }


          try {


            // Check if it's already a preview URL
            if (src.includes('preview')) {
              console.log('Already a preview URL, using directly:', src);
              setImageSrc(src);
              if (!gallerySize) {
                setIsLoaded(true);
                return;
              }
            }
            // Check if it's a download URL
            else if (src.includes('download')) {
              console.log('Already a download URL, using directly:', src);
              setImageSrc(src);
              if (!gallerySize) {
                setIsLoaded(true);
                return;
              }
            }
            // Otherwise, try to get a file preview
            else {
              console.log('Getting file preview for:', src);
              // Assuming src is the file ID and we need to determine the bucket type
              // This is a simplified approach - in a real app, you might need to store bucket info with the file ID
              const bucketType = src.startsWith('gallery_') ? 'gallery' :
                                src.startsWith('banner_') ? 'banner' : 'scanner';

              try {
                // Try to get the preview URL from Supabase instead
                const previewUrl = await getFilePreview(src, bucketType as any);
                console.log('Preview URL from Supabase:', previewUrl);

                if (isMounted) {
                  setImageSrc(previewUrl);
                  if (!gallerySize) {
                    setIsLoaded(true);
                    return;
                  }
                }
              } catch (previewError) {
                console.error('Error getting file preview from Supabase:', previewError);
                // Fallback to using the ID directly
                if (isMounted) {
                  setImageSrc(src);
                  if (!gallerySize) {
                    setIsLoaded(true);
                    return;
                  }
                }
              }
            }

              // Add a cache-busting parameter to the URL
              const cacheBuster = `?t=${Date.now()}`;
              const urlWithCacheBuster = src.includes('?') ? `${src}&t=${Date.now()}` : `${src}${cacheBuster}`;
              console.log('Using original URL with cache buster:', urlWithCacheBuster);

              setImageSrc(urlWithCacheBuster); // Fallback to original URL with cache buster
              if (!gallerySize) {
                setIsLoaded(true);
                return;
              }
            }
          }
        }

        if (gallerySize) {
          try {
            // For gallery images, resize them based on calculated dimensions
            const response = await fetch(src);
            const blob = await response.blob();
            const resizedBlob = await resizeImage(blob, dimensions.width, dimensions.height);

            if (isMounted) {
              objectUrl = URL.createObjectURL(resizedBlob);
              setImageSrc(objectUrl);
            }
          } catch (resizeError) {
            console.warn(`Failed to resize image, using original: ${src}`, resizeError);
            if (isMounted) {
              // Fallback to original image if resizing fails
              setImageSrc(src);
            }
          }
        } else {
          // For full-size images, use the original source
          setImageSrc(src);
        }
      } catch (err) {
        console.error(`Failed to load image: ${src}`, err);
        if (isMounted) {
          setError(true);
          // For Firebase URLs, try to use the original URL as fallback
          if (isFirebaseUrl) {
            setImageSrc(src);
            setIsLoaded(true);
          }
        }
      }
    };

    loadImage();

    // Clean up on unmount
    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isVisible, src, gallerySize, isFirebaseUrl, isLegacyUrl, isSupabaseUrl, dimensions]);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Handle image error event
  const handleImageError = () => {
    setError(true);
    console.error(`Error loading image: ${src}`);
  };

  // Generate srcSet for responsive images
  const [srcSet, setSrcSet] = useState<string | undefined>(undefined);

  // Generate srcSet when src changes
  useEffect(() => {
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      // For Supabase images, use the URL directly
      if (isSupabaseUrl) {
        setSrcSet(`${src} 1x, ${src} 2x`);
      }
      // For legacy images, handle them specially (backward compatibility)
      else if (isLegacyUrl) {
        (async () => {
          try {
            // If it's already a preview URL, use it directly
            if (src.includes('preview')) {
              setSrcSet(`${src} 1x, ${src} 2x`);
            }
            // If it's a download URL, use it directly
            else if (src.includes('download')) {
              setSrcSet(`${src} 1x, ${src} 2x`);
            }
            // Otherwise, try to get a file preview from Supabase
            else {
              // Assuming src is the file ID and we need to determine the bucket type
              const bucketType = src.startsWith('gallery_') ? 'gallery' :
                                src.startsWith('banner_') ? 'banner' : 'scanner';

              try {
                const previewUrl = await getFilePreview(src, bucketType as any);
                setSrcSet(`${previewUrl} 1x, ${previewUrl} 2x`);
              } catch (previewError) {
                console.error('Error getting preview URL for srcSet:', previewError);
                // Fallback to using the original URL
                setSrcSet(`${src} 1x, ${src} 2x`);
              }
            }
          } catch (error) {
            console.error('Error generating srcSet:', error);
            // Add a cache-busting parameter to the URL
            const cacheBuster = `?t=${Date.now()}`;
            const urlWithCacheBuster = src.includes('?') ? `${src}&t=${Date.now()}` : `${src}${cacheBuster}`;
            setSrcSet(`${urlWithCacheBuster} 1x, ${urlWithCacheBuster} 2x`); // Fallback to original URL with cache buster
          }
        })();
      } else {
        // For other images, use the original URL
        setSrcSet(`${src} 1x, ${src} 2x`);
      }
    } else {
      setSrcSet(undefined);
    }
  }, [src, isLegacyUrl, isSupabaseUrl]);

  // Calculate aspect ratio placeholder using the dimensions
  const aspectRatioPercent = dimensions.width && dimensions.height
    ? (dimensions.height / dimensions.width) * 100
    : 0;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: 'transparent', // Changed from placeholderColor to transparent
        paddingBottom: aspectRatioPercent ? `${aspectRatioPercent}%` : undefined,
        width: dimensions.width ? `${dimensions.width}px` : '100%',
        maxWidth: '100%',
        ...style
      }}
      onClick={onClick}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } absolute inset-0 w-full h-full object-cover`}
          style={{ transform: `scale(${scale})` }} // Apply scale transformation
          onLoad={handleImageLoad}
          onError={handleImageError}
          width={dimensions.width}
          height={dimensions.height}
          sizes={sizes}
          srcSet={srcSet}
        />
      )}

      {/* Show loading spinner or error icon */}
      {(!imageSrc || !isLoaded) && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
