// Home page component that displays the banner, gallery images, and COMET Scanner information to users
import React, { useState, useEffect } from '../utils/react-imports';

import HolographicText from '../components/ui/HolographicText';
import { useAuth0Context } from '../contexts/Auth0Context';
import UserProfile from '../components/ui/UserProfile';
import { useNavigate } from 'react-router-dom';
import { supabaseClient, BANNER_BUCKET } from '../supabaseConfig';
import LazyImage from '../components/ui/LazyImage';
import Button from '../components/ui/Button';
import { listFiles } from '../utils/supabaseStorage';

// Default COMET Scanner description and explanation
const DEFAULT_COMET_EXPLANATION = `COMET = Co-integrated Observational Market Evaluation Tool.\n\nA COMET Scanner journeys a few steps farther using the data from a traditional scanner by using them with different visualization techniques and often at very extreme settings to produce very revealing and predictable patterns and similarities in the edge cases of the price action. These \"edge case\" signals may be very far and few between for a single asset, but in my case, the Alert Signals start stacking up when I start to screen all 400+ futures assets on the Blofin Exchange (by having 10 copies of the COMET Scanner on the chart with a different 40 assets selected to be screened for each copy....each copy can screen up to 40 assets max).`;

// Default scanner usage description
const DEFAULT_SCANNER_USAGE = `COMET Scanners are powerful tools for market analysis that help traders identify potential trading opportunities across multiple assets simultaneously. They work by applying custom filters and visualization techniques to price data, highlighting patterns that might be missed by traditional analysis methods.

Key features of COMET Scanners include:
• Multi-asset screening capability (up to 40 assets per scanner instance)
• Custom visualization techniques for pattern recognition
• Extreme parameter settings to identify edge cases
• Real-time alerts for potential trading opportunities
• Configurable filters to match your trading strategy

The COMET Scanner Template Wizard helps you create a customized scanner template tailored to your specific trading needs and preferences.`;

const Home: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth0Context();
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  // State for image scales
  const [bannerScale, setBannerScale] = useState<number>(1);
  const [imageScales, setImageScales] = useState<Record<string, number>>({});

  // State for COMET description content
  const [cometExplanation, setCometExplanation] = useState<string>(() => {
    return localStorage.getItem('comet_explanation') || DEFAULT_COMET_EXPLANATION;
  });

  const [scannerUsage, setScannerUsage] = useState<string>(() => {
    return localStorage.getItem('scanner_usage') || DEFAULT_SCANNER_USAGE;
  });

  // Listen for changes to COMET description content in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'comet_explanation' && e.newValue) {
        setCometExplanation(e.newValue);
      } else if (e.key === 'scanner_usage' && e.newValue) {
        setScannerUsage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch banner and gallery images from Supabase Storage
  const fetchImages = async () => {
    try {
      console.log('Fetching images from Supabase Storage...');

      // Fetch banner images from Supabase
      console.log('Fetching banner images from Supabase...');
      try {
        // Get banner images filtered by image_type
        const bannerFiles = await listFiles('banner');
        console.log('Banner data from Supabase (filtered):', bannerFiles);

        if (bannerFiles.length > 0) {
          // Get the first banner image
          const bannerFile = bannerFiles[0];

          // Use the public URL directly from Supabase
          const publicUrl = bannerFile.publicUrl;

          console.log('Banner public URL from Supabase:', publicUrl);
          setBannerUrl(publicUrl);
        } else {
          console.log('No banner images found in Supabase');
        }
      } catch (error) {
        console.error('Error fetching banner from Supabase:', error);
        throw new Error(`Banner fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Fetch gallery images from Supabase
      console.log('Fetching gallery images from Supabase...');
      try {
        // Get gallery images filtered by image_type
        const galleryFiles = await listFiles('gallery');
        console.log('Gallery data from Supabase (filtered):', galleryFiles);

        if (galleryFiles.length > 0) {
          // Get public URLs for all gallery images
          const publicUrls = galleryFiles.map((file: any) => file.publicUrl);

          console.log('Gallery URLs from Supabase:', publicUrls);
          setGalleryImages(publicUrls);
        } else {
          console.log('No gallery images found in Supabase');
        }
      } catch (error) {
        console.error('Error fetching gallery from Supabase:', error);
        throw new Error(`Gallery fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Failed to load images:', err);
      setError(`Failed to load images: ${err.message || 'Unknown error'}`);
    }
  };

  // Listen for image scale changes from the dashboard
  useEffect(() => {
    const handleImageScaleChange = (event: CustomEvent) => {
      const { id, scale } = event.detail;
      console.log('Home: Received image scale change event:', { id, scale });

      // Force a refresh of the images
      fetchImages();
    };

    // Add event listener
    window.addEventListener('image-scale-changed', handleImageScaleChange as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('image-scale-changed', handleImageScaleChange as EventListener);
    };
  }, []);

  // Initial fetch of images when component mounts
  useEffect(() => {
    fetchImages();
  }, []);

  // Clicking gallery image expands it fullscreen
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-cyan-900 to-blue-700 flex flex-col items-center py-8 px-2">
      {/* Site Title */}
      <HolographicText
        text="COMET SCANNER TEMPLATE WIZARD"
        as="h1"
        variant="title"
        className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg"
      />

      {/* User Profile Section */}
      <div className="w-full max-w-5xl mb-6">
        <UserProfile className="mb-4" />
      </div>

      {/* Banner Section */}
      <div className="w-full max-w-5xl mb-10 flex flex-col items-center">
        {bannerUrl ? (
          <LazyImage
            src={bannerUrl}
            alt="Banner"
            className="rounded-lg shadow-2xl w-full h-72 object-cover"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            loadingStrategy="eager"
            scale={bannerScale}
            aspectRatio="16/9"
            displaySize="large"
          />
        ) : (
          <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">No banner uploaded yet.</div>
        )}
        {error && <div className="text-red-400 mt-2">{error}</div>}
      </div>

      {/* Image Gallery Section */}
      <section className="w-full max-w-6xl mb-12">
        <HolographicText
          text="COMET Scanner Gallery"
          as="h2"
          variant="subtitle"
          className="text-3xl font-semibold text-cyan-100 mb-6 text-center"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gradient-to-br from-cyan-800/30 to-blue-900/30 p-4 rounded-xl shadow-inner">
          {galleryImages.length > 0 ? (
            galleryImages.map((img: string, i: number) => (
              <div key={img} className="aspect-[16/9]">
                <LazyImage
                  src={img}
                  alt={`COMET Gallery ${i + 1}`}
                  className="rounded-lg cursor-pointer w-full h-full hover:scale-105 transition-transform duration-200"
                  onClick={() => setFullscreenImage(img)}
                  style={{ boxShadow: '0 0 20px 2px rgba(0,255,255,0.2)' }}
                  gallerySize={true}
                  scale={imageScales[img] || 1}
                  aspectRatio="16/9"
                  displaySize="medium"
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-cyan-200">
              No gallery images available. The admin can add images through the dashboard.
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setFullscreenImage(null)}>
          <div className="max-h-[90vh] max-w-[90vw]">
            <LazyImage
              src={fullscreenImage}
              alt="Fullscreen COMET"
              className="rounded-lg shadow-2xl w-full h-full"
              loadingStrategy="eager"
              scale={fullscreenImage ? imageScales[fullscreenImage] || 1 : 1}
              aspectRatio="16/9"
              displaySize="large"
            />
          </div>
        </div>
      )}

      {/* Start Wizard Button */}
      <div className="w-full max-w-4xl flex justify-center mb-16">
        <Button
          onClick={() => navigate('/scanner')}
          className="px-8 py-6 text-xl font-bold rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20"
          variant="primary"
        >
          Start the COMET Scanner Template Wizard
        </Button>
      </div>

      {/* COMET Description Section */}
      <section className="w-full max-w-4xl mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg">
        <HolographicText
          text="What is COMET?"
          as="h2"
          variant="subtitle"
          className="text-2xl font-bold text-cyan-200 mb-4 text-center"
        />
        <div className="whitespace-pre-line text-white text-lg leading-relaxed mb-8">
          {cometExplanation}
        </div>

        <HolographicText
          text="COMET Scanner Usage"
          as="h3"
          variant="subtitle"
          className="text-xl font-bold text-cyan-200 mb-4 text-center"
        />
        <div className="whitespace-pre-line text-white text-lg leading-relaxed">
          {scannerUsage}
        </div>
      </section>
    </div>
  );
};

export default Home;
