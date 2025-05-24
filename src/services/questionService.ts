import { SupabaseClient } from '@supabase/supabase-js';

export interface Question {
  id: string;
  text: string;
  type: 'string' | 'boolean' | 'multiple-choice';
  details: {
    image?: {
      url: string;
      preview?: string;
    };
    placeholder?: string;
    booleanOptions?: {
      true: {
        text: string;
        code: string;
      };
      false: {
        text: string;
        code: string;
      };
    };
    multipleChoiceOptions?: Array<{
      id: string;
      text: string;
      code: string;
    }>;
  };
  order: number;
  created_at?: string;
  updated_at?: string;
}

export class QuestionService {
  constructor(private supabase: SupabaseClient) {}

  async getQuestions(): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return data || [];
  }

  async createQuestion(question: Omit<Question, 'id' | 'created_at' | 'updated_at'>): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questions')
      .insert([question])
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      throw error;
    }

    return data;
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      throw error;
    }

    return data;
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  async reorderQuestions(questionIds: string[]): Promise<void> {
    // Create an array of updates, each setting the new order
    const updates = questionIds.map((id, index) => ({
      id,
      order: index + 1
    }));

    const { error } = await this.supabase
      .from('questions')
      .upsert(updates);

    if (error) {
      console.error('Error reordering questions:', error);
      throw error;
    }
  }
}

export const createQuestionService = (supabase: SupabaseClient) => new QuestionService(supabase);