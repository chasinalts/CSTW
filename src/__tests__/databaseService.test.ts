import { describe, it, expect, vi, beforeEach } from 'vitest';
import { databaseService, DatabaseProvider } from '../utils/databaseService';
import { databases } from '../appwriteConfig';
import { supabaseClient } from '../supabaseConfig';

// Import test mocks
import '../setupTests';

describe('Database Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a document in Appwrite for Appwrite collections', async () => {
      const data = { name: 'Test Document' };
      const result = await databaseService.create('content', data);

      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-database',
        'content',
        expect.any(String),
        data
      );

      expect(result).toEqual({ $id: 'appwrite-doc-id', name: 'Test Document' });
    });

    it('should create a record in Supabase for Supabase tables', async () => {
      const data = { name: 'Test Document' };
      const result = await databaseService.create('images', data);

      expect(supabaseClient.from).toHaveBeenCalledWith('images');
      expect(supabaseClient.from().insert).toHaveBeenCalledWith({ ...data, id: undefined });

      expect(result).toEqual({ id: 'supabase-doc-id', name: 'Test Document' });
    });
  });

  describe('get', () => {
    it('should get a document from Appwrite for Appwrite collections', async () => {
      const result = await databaseService.get('content', 'doc-id');

      expect(databases.getDocument).toHaveBeenCalledWith(
        'test-database',
        'content',
        'doc-id'
      );

      expect(result).toEqual({ $id: 'appwrite-doc-id', name: 'Test Document' });
    });

    it('should get a record from Supabase for Supabase tables', async () => {
      const result = await databaseService.get('images', 'doc-id');

      expect(supabaseClient.from).toHaveBeenCalledWith('images');
      expect(supabaseClient.from().select).toHaveBeenCalledWith('*');
      expect(supabaseClient.from().select().eq).toHaveBeenCalledWith('id', 'doc-id');

      expect(result).toEqual({ id: 'supabase-doc-id', name: 'Test Document' });
    });
  });

  describe('list', () => {
    it('should list documents from Appwrite for Appwrite collections', async () => {
      const result = await databaseService.list('content');

      expect(databases.listDocuments).toHaveBeenCalledWith(
        'test-database',
        'content',
        expect.any(Array)
      );

      expect(result).toEqual([{ $id: 'appwrite-doc-id', name: 'Test Document' }]);
    });

    it('should list records from Supabase for Supabase tables', async () => {
      const result = await databaseService.list('images');

      expect(supabaseClient.from).toHaveBeenCalledWith('images');
      expect(supabaseClient.from().select).toHaveBeenCalledWith('*');

      expect(result).toEqual([{ id: 'supabase-doc-id', name: 'Test Document' }]);
    });

    it('should apply filters when provided', async () => {
      const filters = [{ key: 'type', value: 'banner' }];
      await databaseService.list('images', filters);

      expect(supabaseClient.from).toHaveBeenCalledWith('images');
      expect(supabaseClient.from().select).toHaveBeenCalledWith('*');
      expect(supabaseClient.from().select().eq).toHaveBeenCalledWith('type', 'banner');
    });
  });

  describe('update', () => {
    it('should update a document in Appwrite for Appwrite collections', async () => {
      const data = { name: 'Updated Document' };
      const result = await databaseService.update('content', 'doc-id', data);

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-database',
        'content',
        'doc-id',
        data
      );

      expect(result).toEqual({ $id: 'appwrite-doc-id', name: 'Updated Document' });
    });

    it('should update a record in Supabase for Supabase tables', async () => {
      const data = { name: 'Updated Document' };
      const result = await databaseService.update('images', 'doc-id', data);

      expect(supabaseClient.from).toHaveBeenCalledWith('images');
      expect(supabaseClient.from().update).toHaveBeenCalledWith(data);
      expect(supabaseClient.from().update().eq).toHaveBeenCalledWith('id', 'doc-id');

      expect(result).toEqual({ id: 'supabase-doc-id', name: 'Test Document' });
    });
  });

  describe('delete', () => {
    it('should delete a document from Appwrite for Appwrite collections', async () => {
      await databaseService.delete('content', 'doc-id');

      expect(databases.deleteDocument).toHaveBeenCalledWith(
        'test-database',
        'content',
        'doc-id'
      );
    });

    it('should delete a record from Supabase for Supabase tables', async () => {
      await databaseService.delete('images', 'doc-id');

      expect(supabaseClient.from).toHaveBeenCalledWith('images');
      expect(supabaseClient.from().delete).toHaveBeenCalled();
      expect(supabaseClient.from().delete().eq).toHaveBeenCalledWith('id', 'doc-id');
    });
  });
});
