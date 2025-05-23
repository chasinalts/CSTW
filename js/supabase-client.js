// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.');
} else {
    try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized.');
        } else {
            console.error('Supabase SDK not loaded or createClient is not a function.');
        }
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
    }
}

// Expose the Supabase client to the global scope if needed, or export it if using modules
window.supabaseClient = supabase;

// Example functions (can be expanded and moved to specific modules/files)

// --- Generic Data Fetching/Saving --- 
async function fetchData(tableName, selectQuery = '*') {
    if (!supabase) return { data: null, error: 'Supabase client not initialized' };
    try {
        const { data, error } = await supabase.from(tableName).select(selectQuery);
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error(`Error fetching from ${tableName}:`, error);
        return { data: null, error };
    }
}

async function saveData(tableName, rowData) {
    if (!supabase) return { data: null, error: 'Supabase client not initialized' };
    try {
        const { data, error } = await supabase.from(tableName).upsert(rowData, { onConflict: 'id' }).select(); // Assuming 'id' is the primary key for conflict resolution
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error(`Error saving to ${tableName}:`, error);
        return { data: null, error };
    }
}

async function deleteData(tableName, matchCriteria) {
    if (!supabase) return { data: null, error: 'Supabase client not initialized' };
    try {
        const { data, error } = await supabase.from(tableName).delete().match(matchCriteria);
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        return { data: null, error };
    }
}

// --- Specific Application Data Functions (examples) ---

// Banner Image
async function getBannerUrl() {
    // This would typically fetch a URL or identifier from a 'settings' or 'site_config' table
    // For simplicity, let's assume a table 'site_content' with an item for 'banner'
    const { data, error } = await fetchData('site_content', 'content ->> bannerUrl'); // Adjust based on actual schema
    return data && data.length > 0 ? data[0].bannerUrl : null;
}

async function saveBannerUrl(url) {
    // Example: update a specific row or insert if not exists
    return await saveData('site_content', { id: 'banner_settings', content: { bannerUrl: url } });
}

// Gallery Images
async function getGalleryImages() {
    const { data, error } = await fetchData('gallery_images', '*'); // Assuming a table 'gallery_images'
    return data || [];
}

async function addGalleryImage(imageData) { // imageData could be { url: '...', alt_text: '...' }
    return await saveData('gallery_images', imageData);
}

async function deleteGalleryImage(imageId) {
    return await deleteData('gallery_images', { id: imageId });
}

// Home Page Content
async function getHomePageContent() {
    const { data, error } = await fetchData('site_content', '*'); // Assuming a table 'site_content'
    // Find the specific row for home page content, e.g., by a unique ID or type
    return data ? data.find(item => item.id === 'home_page_text') : null;
}

async function saveHomePageContent(content) { // content = { title1: '...', text1: '...', title2: '...', text2: '...' }
    return await saveData('site_content', { id: 'home_page_text', content });
}

// Code Snippets
async function getCodeSnippets() {
    const { data, error } = await fetchData('code_snippets', '*');
    // Example: return { fullTemplate: '...', baseTemplate: '...' }
    const fullTemplate = data?.find(s => s.id === 'full_template')?.code_string;
    const baseTemplate = data?.find(s => s.id === 'base_template')?.code_string;
    return { fullTemplate, baseTemplate };
}

async function saveCodeSnippets(fullTemplate, baseTemplate) {
    await saveData('code_snippets', { id: 'full_template', code_string: fullTemplate });
    await saveData('code_snippets', { id: 'base_template', code_string: baseTemplate });
}

// Questions
async function getQuestions() {
    const { data, error } = await fetchData('wizard_questions', '*');
    return data ? data.sort((a, b) => a.order - b.order) : []; // Assuming an 'order' field
}

async function saveQuestion(questionData) {
    return await saveData('wizard_questions', questionData);
}

async function saveQuestionsOrder(questionsArray) { // [{id: 1, order: 0}, {id: 2, order: 1}]
    // Supabase upsert can handle multiple rows if passed as an array
    return await saveData('wizard_questions', questionsArray);
}

async function deleteQuestion(questionId) {
    return await deleteData('wizard_questions', { id: questionId });
}

// User Saved Templates (Wizard)
async function getUserSavedTemplates(userId) {
    if (!userId) return [];
    const { data, error } = await fetchData('user_templates', `*, user_id=eq.${userId}`);
    return data || [];
}

async function saveUserTemplate(templateData) { // { user_id: '...', name: '...', code: '...', ... }
    return await saveData('user_templates', templateData);
}

async function deleteUserTemplate(templateId, userId) {
    return await deleteData('user_templates', { id: templateId, user_id: userId });
}

// Expose specific functions if needed
window.db = {
    fetchData,
    saveData,
    deleteData,
    getBannerUrl,
    saveBannerUrl,
    getGalleryImages,
    addGalleryImage,
    deleteGalleryImage,
    getHomePageContent,
    saveHomePageContent,
    getCodeSnippets,
    saveCodeSnippets,
    getQuestions,
    saveQuestion,
    saveQuestionsOrder,
    deleteQuestion,
    getUserSavedTemplates,
    saveUserTemplate,
    deleteUserTemplate
};

export const supabaseClient = supabase; // Add this line