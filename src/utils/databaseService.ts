// Database service for interacting with Supabase
import { supabaseClient } from '../supabaseConfig';

// Define types
export interface Filter {
  key: string;
  value: any;
  operator?: string;
}

export interface DatabaseRecord {
  id: string;
  [key: string]: any;
}

// Database service
class DatabaseService {
  /**
   * List records from a collection with optional filters
   * @param collection The collection to query
   * @param filters Optional filters to apply
   * @returns Array of records
   */
  async list(collection: string, filters?: Filter[]): Promise<DatabaseRecord[]> {
    try {
      let query = supabaseClient.from(collection).select('*');
      
      // Apply filters if provided
      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          const { key, value, operator = 'eq' } = filter;
          
          switch (operator) {
            case 'eq':
              query = query.eq(key, value);
              break;
            case 'neq':
              query = query.neq(key, value);
              break;
            case 'gt':
              query = query.gt(key, value);
              break;
            case 'gte':
              query = query.gte(key, value);
              break;
            case 'lt':
              query = query.lt(key, value);
              break;
            case 'lte':
              query = query.lte(key, value);
              break;
            case 'like':
              query = query.like(key, `%${value}%`);
              break;
            case 'ilike':
              query = query.ilike(key, `%${value}%`);
              break;
            case 'in':
              query = query.in(key, value);
              break;
            default:
              query = query.eq(key, value);
          }
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error listing ${collection}:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error in list ${collection}:`, error);
      return [];
    }
  }
  
  /**
   * Get a single record by ID
   * @param collection The collection to query
   * @param id The ID of the record to get
   * @returns The record or null if not found
   */
  async get(collection: string, id: string): Promise<DatabaseRecord | null> {
    try {
      const { data, error } = await supabaseClient
        .from(collection)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error getting ${collection} ${id}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in get ${collection} ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new record
   * @param collection The collection to add to
   * @param data The data to add
   * @returns The created record or null if failed
   */
  async create(collection: string, data: any): Promise<DatabaseRecord | null> {
    try {
      const { data: createdData, error } = await supabaseClient
        .from(collection)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating ${collection}:`, error);
        return null;
      }
      
      return createdData;
    } catch (error) {
      console.error(`Error in create ${collection}:`, error);
      return null;
    }
  }
  
  /**
   * Update an existing record
   * @param collection The collection to update
   * @param id The ID of the record to update
   * @param data The data to update
   * @returns The updated record or null if failed
   */
  async update(collection: string, id: string, data: any): Promise<DatabaseRecord | null> {
    try {
      const { data: updatedData, error } = await supabaseClient
        .from(collection)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating ${collection} ${id}:`, error);
        return null;
      }
      
      return updatedData;
    } catch (error) {
      console.error(`Error in update ${collection} ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a record
   * @param collection The collection to delete from
   * @param id The ID of the record to delete
   * @returns True if successful, false otherwise
   */
  async delete(collection: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from(collection)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting ${collection} ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error in delete ${collection} ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Upsert a record (create if not exists, update if exists)
   * @param collection The collection to upsert to
   * @param data The data to upsert
   * @param onConflict The column to check for conflicts
   * @returns The upserted record or null if failed
   */
  async upsert(collection: string, data: any, onConflict: string = 'id'): Promise<DatabaseRecord | null> {
    try {
      const { data: upsertedData, error } = await supabaseClient
        .from(collection)
        .upsert(data, { onConflict })
        .select()
        .single();
      
      if (error) {
        console.error(`Error upserting ${collection}:`, error);
        return null;
      }
      
      return upsertedData;
    } catch (error) {
      console.error(`Error in upsert ${collection}:`, error);
      return null;
    }
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();
