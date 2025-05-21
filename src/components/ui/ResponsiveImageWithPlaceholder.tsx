import React from 'react';
import LazyImage from './LazyImage';

interface ResponsiveImageWithPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  gallerySize?: boolean; // New prop to indicate gallery image
}

/**
 * A wrapper around LazyImage for backward compatibility
 * @deprecated Use LazyImage component directly for better performance
 */
const ResponsiveImageWithPlaceholder: React.FC<ResponsiveImageWithPlaceholderProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  style = {},
  onClick,
  loading = 'lazy',
  gallerySize = false,
}) => {
  // Convert loading prop to loadingStrategy for LazyImage
  const loadingStrategy = loading === 'eager' ? 'eager' : 'lazy';

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onClick={onClick}
      gallerySize={gallerySize}
      sizes={sizes}
      loadingStrategy={loadingStrategy}
    />
  );
};

export default ResponsiveImageWithPlaceholder;
