// Mock for databaseService.ts
import { vi } from 'vitest';

// Mock data
const mockContent = [
  {
    id: 'content-1',
    type: 'banner',
    title: 'Banner 1',
    imageUrl: 'https://example.com/banner1.jpg',
    updatedAt: Date.now(),
  },
  {
    id: 'content-2',
    type: 'scanner',
    title: 'Scanner 1',
    imageUrl: 'https://example.com/scanner1.jpg',
    updatedAt: Date.now() - 1000,
  },
];

const mockTemplates = [
  {
    id: 'template-1',
    title: 'Template 1',
    content: 'Template 1 content',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Mock functions
export const createDocument = vi.fn().mockImplementation((collection, data) => {
  return Promise.resolve({
    id: 'new-doc-id',
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
});

export const updateDocument = vi.fn().mockImplementation((collection, id, data) => {
  return Promise.resolve({
    id,
    ...data,
    updatedAt: Date.now(),
  });
});

export const deleteDocument = vi.fn().mockResolvedValue(true);

export const getDocument = vi.fn().mockImplementation((collection, id) => {
  if (collection === 'content') {
    const doc = mockContent.find(item => item.id === id);
    return Promise.resolve(doc || null);
  }
  if (collection === 'templates') {
    const doc = mockTemplates.find(item => item.id === id);
    return Promise.resolve(doc || null);
  }
  return Promise.resolve(null);
});

export const list = vi.fn().mockImplementation((collection, queries = {}) => {
  if (collection === 'content') {
    return Promise.resolve(mockContent);
  }
  if (collection === 'templates') {
    return Promise.resolve(mockTemplates);
  }
  return Promise.resolve([]);
});

export const query = vi.fn().mockImplementation((collection, field, value) => {
  if (collection === 'content') {
    return Promise.resolve(mockContent.filter(item => item[field] === value));
  }
  if (collection === 'templates') {
    return Promise.resolve(mockTemplates.filter(item => item[field] === value));
  }
  return Promise.resolve([]);
});

// Export the mock functions
export default {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  list,
  query,
};
