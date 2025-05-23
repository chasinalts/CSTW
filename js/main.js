document.addEventListener('DOMContentLoaded', () => {
    // Image Modal Functionality
    const modal = document.getElementById('image-modal');
    const expandedImg = document.getElementById('expanded-img');
    const closeModalSpan = document.querySelector('#image-modal .close-modal');

    window.expandImage = function(src) {
        if (modal && expandedImg) {
            modal.style.display = 'flex'; // Use flex to center content
            expandedImg.src = src;
        }
    }

    if (closeModalSpan) {
        closeModalSpan.onclick = function() {
            if (modal) modal.style.display = 'none';
        }
    }

    // Close modal if user clicks outside the image content
    if (modal) {
        modal.onclick = function(event) {
            if (event.target === modal) { // Check if the click is on the modal background itself
                modal.style.display = 'none';
            }
        }
    }

    // Navigate to Wizard Page
    const startWizardBtn = document.getElementById('start-wizard-btn');
    if (startWizardBtn) {
        startWizardBtn.addEventListener('click', () => {
            window.location.href = '/scanner';
        });
    }

    // Auth.js handles login/logout UI and events.

    async function loadBanner() {
        const siteBannerImg = document.getElementById('site-banner-img');
        const bannerPlaceholder = document.getElementById('banner-placeholder');
        if (!siteBannerImg || !bannerPlaceholder) return;

        if (window.db && typeof window.db.getBannerUrl === 'function') {
            const bannerUrl = await window.db.getBannerUrl(); // Assumes getBannerUrl returns the direct URL or null
            if (bannerUrl) {
                siteBannerImg.src = bannerUrl;
                siteBannerImg.style.display = 'block';
                bannerPlaceholder.style.display = 'none';
            } else {
                siteBannerImg.style.display = 'none';
                bannerPlaceholder.style.display = 'block';
            }
        } else {
            console.warn('Supabase client or getBannerUrl not available. Banner will not be loaded from DB.');
            siteBannerImg.style.display = 'none';
            bannerPlaceholder.style.display = 'block';
        }
    }

    async function loadGalleryImages() {
        const imageGallery = document.querySelector('.image-gallery');
        if (!imageGallery) return;

        if (window.db && typeof window.db.getGalleryImages === 'function') {
            const images = await window.db.getGalleryImages(); // Assumes getGalleryImages returns array of { url: '...', alt_text: '...' } or similar
            if (images && images.length > 0) {
                imageGallery.innerHTML = ''; // Clear placeholders
                images.forEach(imgData => {
                    const imgElement = document.createElement('img');
                    imgElement.src = imgData.url; // Adjust if image data structure is different
                    imgElement.alt = imgData.alt_text || 'Scanner Image';
                    imgElement.onclick = () => expandImage(imgData.url);
                    imageGallery.appendChild(imgElement);
                });
            } else {
                // Keep placeholder images or show a message if nothing is stored
                // For now, if empty, placeholders from HTML will remain if not cleared, or show empty if cleared.
                // To be safe, let's ensure placeholders are cleared if no images are loaded.
                if (images && images.length === 0) {
                    imageGallery.innerHTML = '<p>No gallery images have been uploaded yet.</p>';
                }
            }
        } else {
            console.warn('Supabase client or getGalleryImages not available. Gallery will not be loaded from DB.');
        }
    }

    // Load dynamic content after Auth0 and Supabase clients are expected to be initialized
    // auth.js calls updateUI on DOMContentLoaded and after login, which should handle general UI state.
    // Specific content loading can happen here.
    loadBanner();
    loadGalleryImages();

    // Expose loadGalleryImagesFromStorage for dashboard.js to call (though this cross-file call is not ideal)
    // A better approach would be event-driven updates or dashboard directly re-fetching.
    // For now, keeping it to minimize structural changes if dashboard.js relies on it.
    window.loadGalleryImagesFromStorage = loadGalleryImages; 

});