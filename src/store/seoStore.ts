import { create } from 'zustand';

export interface SEOData {
  id: number;
  url: string;
  created_at?: string;
  current_title: string;
  suggested_title: string;
  current_description: string;
  suggested_description: string;
  current_h1: string;
  suggested_h1: string;
  current_h2s: string[];
  suggested_h2s: string[];
  current_h3s: string[];
  suggested_h3s: string[];
  current_h4s: string[];
  suggested_h4s: string[];
  visible_text?: string[];
}

interface SEOStore {
  seoData: SEOData[];
  addSEOData: (data: SEOData) => void;
  clearSEOData: () => void;
}

export const useSEOStore = create<SEOStore>()((set) => ({
  seoData: [],
  addSEOData: (data) => {
    console.log('Adding data to store:', data);
    set((state) => ({
      seoData: [...state.seoData, data],
    }));
  },
  clearSEOData: () => set({ seoData: [] }),
}));