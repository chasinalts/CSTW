import { SupabaseClient } from '@supabase/supabase-js';

export interface Scanner {
  id: string;
  user_id: string;
  name: string;
  description: string;
  code: string;
  answers: Record<string, any>;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export class ScannerService {
  constructor(private supabase: SupabaseClient) {}

  async getUserScanners(userId: string): Promise<Scanner[]> {
    const { data, error } = await this.supabase
      .from('user_scanners')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user scanners:', error);
      throw error;
    }

    return data || [];
  }

  async getPublicScanners(): Promise<Scanner[]> {
    const { data, error } = await this.supabase
      .from('user_scanners')
      .select('*, profiles:user_id(email)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public scanners:', error);
      throw error;
    }

    return data || [];
  }

  async saveScanner(scanner: Omit<Scanner, 'id' | 'created_at' | 'updated_at'>): Promise<Scanner> {
    const { data, error } = await this.supabase
      .from('user_scanners')
      .insert([scanner])
      .select()
      .single();

    if (error) {
      console.error('Error saving scanner:', error);
      throw error;
    }

    return data;
  }

  async updateScanner(id: string, updates: Partial<Scanner>): Promise<Scanner> {
    const { data, error } = await this.supabase
      .from('user_scanners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scanner:', error);
      throw error;
    }

    return data;
  }

  async deleteScanner(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_scanners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scanner:', error);
      throw error;
    }
  }

  async togglePublicStatus(id: string, isPublic: boolean): Promise<Scanner> {
    const { data, error } = await this.supabase
      .from('user_scanners')
      .update({ is_public: isPublic })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scanner visibility:', error);
      throw error;
    }

    return data;
  }

  async getScanner(id: string): Promise<Scanner | null> {
    const { data, error } = await this.supabase
      .from('user_scanners')
      .select('*, profiles:user_id(email)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching scanner:', error);
      return null;
    }

    return data;
  }
}

export const createScannerService = (supabase: SupabaseClient) => new ScannerService(supabase);