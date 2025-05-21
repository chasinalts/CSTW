import React, { useState } from '../../utils/react-imports';
import HolographicText from '../../components/ui/HolographicText';
import { motion } from 'framer-motion';
import Modal from '../../components/ui/Modal';
import { useAdminContent, type ImageContent } from '../../hooks/useAdminContent';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ResponsiveImageWithPlaceholder from '../../components/ui/ResponsiveImageWithPlaceholder';
import VirtualizedImageGallery from '../../components/ui/VirtualizedImageGallery';
import LazyImage from '../../components/ui/LazyImage';

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};

const StepOne = () => {
  const { getBannerImage, getScannerImages } = useAdminContent();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  // Get banner and scanner images from admin content
  const bannerContent = getBannerImage();
  const scannerImages = getScannerImages();

  return (
    <div className="dark">
      <div className="min-h-screen bg-gray-900 transition-colors duration-200">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="relative"
        >
          {/* Title Section */}
          <motion.div
            variants={itemVariants}
            className="py-12 px-4 text-center"
          >
            <HolographicText text="COMET Scanner" as="h1" variant="title" className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white font-display tracking-tight" />
<HolographicText text="Template Wizard" as="h1" variant="title" className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white font-display tracking-tight" />
          </motion.div>

          {/* Banner Section */}
          <motion.div
            variants={itemVariants}
            className="relative w-full mb-12 bg-gray-100 dark:bg-gray-800"
          >
            {bannerContent ? (
              <div className="relative w-full flex items-center justify-center overflow-hidden">
                <div className="w-full" style={{ paddingBottom: '42.85%' }}>
                  <LazyImage
                    src={bannerContent.src}
                    alt="COMET Scanner Banner"
                    className="absolute top-0 left-0 w-full h-full object-contain transition-transform duration-300"
                    style={{
                      transform: `scale(${bannerContent.scale || 1})`,
                      transformOrigin: 'center center'
                    }}
                    loadingStrategy="eager"
                    gallerySize={false}
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                  {bannerContent.displayText && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl text-white font-semibold bg-black bg-opacity-30 px-6 py-3 rounded-lg">
                        {bannerContent.displayText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full" style={{ paddingBottom: '42.85%' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-3xl text-white font-semibold">
                    Visualize Your Data with COMET Scanner
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Content Container */}
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Section Heading */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-12 relative"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <HolographicText text="COMET Scanner Variations" as="h2" variant="subtitle" className="relative inline-block px-4 text-4xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-900" />
            </motion.div>

            {/* Scanner Variations Grid - Using Virtualized Gallery */}
            {scannerImages.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="w-full"
              >
                <VirtualizedImageGallery
                  images={scannerImages}
                  onImageClick={(image) => {
                    setSelectedImage(image.src);
                    setSelectedTitle(image.displayText || image.alt);
                  }}
                  columnCount={4}
                  itemGap={16}
                  className="mb-8"
                  itemClassName="aspect-square"
                  loadingStrategy="lazy"
                />
              </motion.div>
            )}
            {scannerImages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No scanner variations have been uploaded yet.
                  {currentUser?.isOwner && (
                    <span className="block mt-2 text-blue-600 dark:text-blue-400">
                      Visit the admin dashboard to add scanner variations.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <Modal
            isOpen={true}
            onClose={() => {
              setSelectedImage(null);
              setSelectedTitle('');
            }}
            title={selectedTitle}
            size="xl"
          >
            <div className="relative">
              <div className="flex justify-center items-center bg-white dark:bg-gray-800 rounded-lg p-4">
                <LazyImage
                  src={selectedImage}
                  alt={selectedTitle}
                  className="max-w-full max-h-[80vh] object-contain"
                  loadingStrategy="eager"
                  gallerySize={false}
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default StepOne;