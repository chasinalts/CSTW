import { SupabaseClient } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  auth_id: string;
  email: string;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async createProfile(auth_id: string, email: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([{ auth_id, email }])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return data;
  }

  async updateProfile(auth_id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('auth_id', auth_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  }

  async isAdmin(auth_id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('is_admin')
      .eq('auth_id', auth_id)
      .single();

    if (error || !data) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data.is_admin;
  }
}

export const createProfileService = (supabase: SupabaseClient) => new ProfileService(supabase);