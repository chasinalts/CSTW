// Supabase configuration file for the COMET Scanner Template Wizard
import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from './utils/loadEnvVars';

// Get Supabase URL and key from environment variables
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Storage bucket names
export const BANNER_BUCKET = 'banner';
export const GALLERY_BUCKET = 'gallery';
export const SCANNER_BUCKET = 'scanner';

// Create Supabase client
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Generic Data Fetching/Saving ---
export async function fetchData(tableName: string, selectQuery = '*') {
  try {
    const { data, error } = await supabaseClient.from(tableName).select(selectQuery);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return { data: null, error };
  }
}

export async function saveData(tableName: string, rowData: any) {
  try {
    const { data, error } = await supabaseClient
      .from(tableName)
      .upsert(rowData, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error saving to ${tableName}:`, error);
    return { data: null, error };
  }
}

export async function deleteData(tableName: string, id: string | number) {
  try {
    const { data, error } = await supabaseClient.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    return { data: null, error };
  }
}

// --- Banner Image ---
export async function getBannerUrl() {
  try {
    const { data, error } = await supabaseClient.from('site_content').select('content').eq('id', 'banner_settings');
    if (error) throw error;
    return data && data.length > 0 ? data[0].content?.bannerUrl : null;
  } catch (error) {
    console.error('Error fetching banner URL:', error);
    return null;
  }
}

export async function saveBannerUrl(url: string) {
  return await saveData('site_content', { id: 'banner_settings', content: { bannerUrl: url } });
}

// --- Gallery Images ---
export async function getGalleryImages() {
  try {
    const { data, error } = await supabaseClient.from('site_content').select('content').eq('id', 'gallery_images');
    if (error) throw error;
    return data && data.length > 0 ? data[0].content?.images || [] : [];
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export async function addGalleryImage(imageUrl: string) {
  try {
    // First get existing images
    const currentImages = await getGalleryImages();
    // Add new image if not already present
    if (!currentImages.includes(imageUrl)) {
      const updatedImages = [...currentImages, imageUrl];
      return await saveData('site_content', { id: 'gallery_images', content: { images: updatedImages } });
    }
    return { data: null, error: null }; // No change needed
  } catch (error) {
    console.error('Error adding gallery image:', error);
    return { data: null, error };
  }
}

export async function deleteGalleryImage(imageUrl: string) {
  try {
    // First get existing images
    const currentImages = await getGalleryImages();
    // Remove the specified image
    const updatedImages = currentImages.filter((url: string) => url !== imageUrl);
    return await saveData('site_content', { id: 'gallery_images', content: { images: updatedImages } });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return { data: null, error };
  }
}

// --- Home Page Content ---
export async function getHomePageContent() {
  try {
    const { data, error } = await supabaseClient.from('site_content').select('content').eq('id', 'home_page_content');
    if (error) throw error;
    return data && data.length > 0 ? data[0].content : null;
  } catch (error) {
    console.error('Error fetching home page content:', error);
    return null;
  }
}

export async function saveHomePageContent(content: any) {
  return await saveData('site_content', { id: 'home_page_content', content });
}

// --- Code Snippets ---
export async function getCodeSnippets() {
  try {
    const { data, error } = await supabaseClient.from('code_snippets').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching code snippets:', error);
    return [];
  }
}

export async function saveCodeSnippets(snippets: any) {
  return await saveData('code_snippets', snippets);
}

// --- Questions ---
export async function getQuestions() {
  try {
    const { data, error } = await supabaseClient.from('questions').select('*').order('order_index');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

export async function saveQuestion(question: any) {
  return await saveData('questions', question);
}

export async function saveQuestionsOrder(questions: any[]) {
  try {
    // Update each question with its new order_index
    const updates = questions.map((q, index) => ({
      id: q.id,
      order_index: index
    }));

    const { data, error } = await supabaseClient.from('questions').upsert(updates);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving questions order:', error);
    return { data: null, error };
  }
}

export async function deleteQuestion(id: string | number) {
  return await deleteData('questions', id);
}

// --- User Saved Templates ---
export async function getUserSavedTemplates(userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('user_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user templates:', error);
    return [];
  }
}

export async function saveUserTemplate(template: any) {
  return await saveData('user_templates', template);
}

export async function deleteUserTemplate(id: string | number) {
  return await deleteData('user_templates', id);
}
