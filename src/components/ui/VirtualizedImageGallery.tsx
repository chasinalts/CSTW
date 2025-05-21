import React, { useState, useEffect, useRef, useCallback } from 'react';
import LazyImage from './LazyImage';
import type { ImageContent } from '../../hooks/useAdminContent';

interface VirtualizedImageGalleryProps {
  images: ImageContent[];
  onImageClick?: (image: ImageContent) => void;
  className?: string;
  itemClassName?: string;
  columnCount?: number;
  itemGap?: number;
  loadingStrategy?: 'lazy' | 'eager';
}

/**
 * A virtualized image gallery component that only renders images that are visible
 * or about to become visible in the viewport
 */
const VirtualizedImageGallery: React.FC<VirtualizedImageGalleryProps> = ({
  images,
  onImageClick,
  className = '',
  itemClassName = '',
  columnCount = 3,
  itemGap = 16,
  loadingStrategy = 'lazy'
}) => {
  // State for tracking visible range
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(20); // Initial batch size
  
  // Refs for container and intersection observer
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  
  // Calculate how many items to render based on screen size
  const calculateItemsToRender = useCallback(() => {
    if (!containerRef.current) return 20;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = window.innerHeight;
    const itemWidth = (containerWidth - (columnCount - 1) * itemGap) / columnCount;
    const itemHeight = itemWidth; // Assuming square items
    
    // Calculate how many rows would fit in viewport plus buffer
    const rowsInViewport = Math.ceil(containerHeight / (itemHeight + itemGap)) + 2; // +2 for buffer
    
    // Calculate total items that would be visible
    return rowsInViewport * columnCount;
  }, [columnCount, itemGap]);
  
  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!loadMoreTriggerRef.current) return;
    
    // Create observer for infinite scrolling
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && visibleEndIndex < images.length) {
          // Load more items when trigger element is visible
          const itemsToRender = calculateItemsToRender();
          setVisibleEndIndex(prev => Math.min(prev + itemsToRender, images.length));
        }
      },
      { rootMargin: '200px' }
    );
    
    // Start observing the trigger element
    observerRef.current.observe(loadMoreTriggerRef.current);
    
    // Clean up observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleEndIndex, images.length, calculateItemsToRender]);
  
  // Update visible range when window is resized
  useEffect(() => {
    const handleResize = () => {
      const itemsToRender = calculateItemsToRender();
      setVisibleEndIndex(prev => Math.min(visibleStartIndex + itemsToRender, images.length));
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial calculation
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [visibleStartIndex, images.length, calculateItemsToRender]);
  
  // Get visible images
  const visibleImages = images.slice(visibleStartIndex, visibleEndIndex);
  
  // Handle image click
  const handleImageClick = (image: ImageContent) => {
    if (onImageClick) {
      onImageClick(image);
    }
  };
  
  // Generate grid template columns based on column count
  const gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
  
  return (
    <div 
      ref={containerRef}
      className={`w-full ${className}`}
    >
      <div 
        className="grid gap-4"
        style={{ 
          gridTemplateColumns,
          gap: `${itemGap}px`
        }}
      >
        {visibleImages.map((image) => (
          <div
            key={image.id}
            className={`cursor-pointer group relative overflow-hidden rounded-lg ${itemClassName}`}
            onClick={() => handleImageClick(image)}
          >
            <LazyImage
              src={image.src}
              alt={image.alt || 'Gallery image'}
              className="w-full h-full transition-transform duration-300"
              style={{
                transform: `scale(${image.scale || 1})`,
                transformOrigin: 'center center'
              }}
              gallerySize={true}
              loadingStrategy={loadingStrategy}
              sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
            
            {image.displayText && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white">
                <p className="text-sm truncate">{image.displayText}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Trigger element for loading more images */}
      {visibleEndIndex < images.length && (
        <div 
          ref={loadMoreTriggerRef}
          className="w-full h-20 flex items-center justify-center mt-4"
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Show message when all images are loaded */}
      {visibleEndIndex >= images.length && images.length > 0 && (
        <div className="w-full text-center text-gray-500 mt-4 py-4">
          All images loaded
        </div>
      )}
      
      {/* Show message when no images are available */}
      {images.length === 0 && (
        <div className="w-full text-center text-gray-500 mt-4 py-8">
          No images available
        </div>
      )}
    </div>
  );
};

export default VirtualizedImageGallery;
