import { create } from 'zustand';

export interface SEOData {
  id: number;
  url: string;
  created_at?: string;
  current_title: string;
  suggested_title: string;
  title_context?: string;
  current_description: string;
  suggested_description: string;
  description_context?: string;
  current_h1: string;
  suggested_h1: string;
  h1_context?: string;
  current_h2s: string[];
  suggested_h2s: string[];
  h2s_context?: string[];
  current_h3s: string[];
  suggested_h3s: string[];
  h3s_context?: string[];
  current_h4s: string[];
  suggested_h4s: string[];
  h4s_context?: string[];
  visible_text?: string[];
  date?: string;
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
      seoData: [
        ...state.seoData,
        {
          ...data,
          date: new Date().toISOString().split('T')[0],
        },
      ],
    }));
  },
  clearSEOData: () => set({ seoData: [] }),
}));