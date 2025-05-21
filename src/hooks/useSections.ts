import { useState, useEffect } from '../utils/react-imports';

export interface Section {
  id: string;
  title: string;
  code: string;
  isMandatory: boolean; // Indicates if this section is always included
}

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>(() => {
    const savedSections = localStorage.getItem('admin_sections');
    return savedSections ? JSON.parse(savedSections) : [];
  });

  useEffect(() => {
    localStorage.setItem('admin_sections', JSON.stringify(sections));
  }, [sections]);

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      code: '',
      isMandatory: false
    };
    setSections(prev => [...prev, newSection]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const reorderSections = (newOrder: Section[]) => {
    setSections(newOrder);
  };

  return {
    sections,
    setSections,
    addSection,
    updateSection,
    deleteSection,
    reorderSections
  };
};

export default useSections;