// Component that displays an image thumbnail with controls for scaling, sizing, and deletion
import React, { useState, useEffect } from 'react';
import TrashIcon from './TrashIcon';
import ImageSizeControls from './ImageSizeControls';

interface ImageThumbnailProps {
  id: string;
  src: string;
  alt: string;
  scale?: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  displaySize?: 'small' | 'medium' | 'large' | 'custom';
  onScaleChange: (id: string, scale: number) => void;
  onDelete: (id: string) => void;
  onSizeChange?: (id: string, size: 'small' | 'medium' | 'large' | 'custom') => void;
  onDimensionsChange?: (id: string, width: number, height: number) => void;
  onAspectRatioChange?: (id: string, aspectRatio: string) => void;
  className?: string;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  id,
  src,
  alt,
  scale = 1,
  width,
  height,
  aspectRatio = '16/9',
  displaySize = 'medium',
  onScaleChange,
  onDelete,
  onSizeChange,
  onDimensionsChange,
  onAspectRatioChange,
  className = '',
}) => {
  const [localScale, setLocalScale] = useState<number>(scale);
  const [showSizeControls, setShowSizeControls] = useState<boolean>(false);

  // Update local scale when prop changes
  useEffect(() => {
    setLocalScale(scale);
  }, [scale]);

  // Handle scale change from slider
  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setLocalScale(newScale);
    onScaleChange(id, newScale);
  };

  return (
    <div
      className={`group border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="p-4 space-y-4">
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${localScale})` }}
          />

          {/* Delete button - always visible */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this image?')) {
                onDelete(id);
              }
            }}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            title="Delete image"
          >
            <TrashIcon className="w-4 h-4" />
          </button>

          {/* Resize controls - always visible */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2"
          >
            <div className="flex items-center space-x-2">
              <span className="text-white text-xs">Small</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={localScale}
                onChange={handleScaleChange}
                className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-white text-xs">Large</span>
            </div>
            <div className="text-center text-white text-xs mt-1">
              {Math.round(localScale * 100)}%
            </div>
          </div>
        </div>

        {/* Toggle size controls button */}
        <button
          onClick={() => setShowSizeControls(!showSizeControls)}
          className="mt-2 text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          {showSizeControls ? 'Hide Size Controls' : 'Show Size Controls'}
        </button>

        {/* Size controls */}
        {showSizeControls && onSizeChange && onDimensionsChange && onAspectRatioChange && (
          <ImageSizeControls
            id={id}
            currentSize={displaySize}
            currentWidth={width}
            currentHeight={height}
            currentAspectRatio={aspectRatio}
            onSizeChange={onSizeChange}
            onDimensionsChange={onDimensionsChange}
            onAspectRatioChange={onAspectRatioChange}
          />
        )}
      </div>
    </div>
  );
};

export default ImageThumbnail;
