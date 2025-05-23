import React, { useEffect, useRef, useState } from 'react'; // Add useState
import { motion, AnimatePresence } from 'framer-motion';
import HolographicText from '../ui/HolographicText'; // For title
import { useAdminContent, type ImageContent } from '../../hooks/useAdminContent';
import LazyImage from '../ui/LazyImage';
import Modal from '../ui/Modal';

interface ScannerGallerySideWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScannerGallerySideWindow: React.FC<ScannerGallerySideWindowProps> = ({ isOpen, onClose }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const { getScannerImages } = useAdminContent();
  const [scannerImages, setScannerImages] = useState<ImageContent[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageContent | null>(null);

  useEffect(() => {
    // Fetch images when the component is open or when getScannerImages changes
    // This assumes getScannerImages() itself is memoized or stable if contents don't change
    if (isOpen) {
      setScannerImages(getScannerImages());
    }
  }, [isOpen, getScannerImages]);

  // Click outside to close logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const variants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: '100%', transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={windowRef}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-0 right-0 h-full w-full max-w-md md:max-w-lg z-40 futuristic-container has-scanline shadow-2xl flex flex-col" // z-40 to be below modals (z-50)
          // Add specific background/padding if futuristic-container doesn't cover it enough, e.g., bg-gray-900/90 p-4
        >
          {/* Header of the Side Window */}
          <div className="flex justify-between items-center p-4 border-b border-cyan-400/30">
            <HolographicText text="Scanner Gallery" as="h3" variant="subtitle" />
            <button 
              onClick={onClose} 
              className="text-cyan-300 hover:text-white p-1"
              aria-label="Close scanner gallery"
            >
              {/* Simple X icon for now, can be replaced with an SVG icon component later */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-grow p-4 overflow-y-auto">
            {scannerImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3"> {/* Adjusted gap and cols for a side panel */}
                {scannerImages.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-video rounded-md overflow-hidden cursor-pointer group relative futuristic-container p-0.5" // Added futuristic-container for border effect
                    onClick={() => setSelectedImage(image)}
                  >
                    <LazyImage
                      src={image.src}
                      alt={image.alt || 'Scanner variation'}
                      className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-125" // Enlarged scale for 30% -> 1.3 is too much, 1.25 or 1.2
                      // Ensure group-hover:scale-125 is defined or use transform: scale(1.25) in a style tag or CSS if Tailwind JIT doesn't pick it up.
                      // For simplicity, let's assume direct tailwind class works. If not, worker can use inline style for hover.
                    />
                    {image.displayText && (
                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {image.displayText}
                        </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">No scanner variations available.</p>
            )}

            {/* Lightbox Modal for Selected Image */}
            {selectedImage && (
              <Modal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                title={selectedImage.alt || 'Scanner Variation'}
                size="2xl" // Or "xl", "3xl" depending on how large it should be
              >
                <div className="p-2 bg-gray-800/50 rounded-lg"> {/* Slight padding for modal content area */}
                  <LazyImage
                    src={selectedImage.src}
                    alt={selectedImage.alt || 'Enlarged scanner variation'}
                    className="max-w-full max-h-[80vh] object-contain mx-auto"
                    loadingStrategy="eager" // Load full image eagerly for modal
                  />
                  {selectedImage.displayText && (
                      <p className="text-center text-white text-sm mt-2">{selectedImage.displayText}</p>
                  )}
                </div>
              </Modal>
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScannerGallerySideWindow;
