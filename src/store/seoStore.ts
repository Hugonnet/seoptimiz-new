import { create } from 'zustand';

interface SEOAnalysis {
  id: number;
  url: string;
  company?: string;
  created_at?: string;
  current_title?: string;
  suggested_title?: string;
  current_description?: string;
  suggested_description?: string;
  current_h1?: string;
  suggested_h1?: string;
  current_h2s?: string[];
  suggested_h2s?: string[];
  current_h3s?: string[];
  suggested_h3s?: string[];
  current_h4s?: string[];
  suggested_h4s?: string[];
  archived?: boolean;
}

interface SEOStore {
  seoData: SEOAnalysis[];
  setSEOData: (data: SEOAnalysis[]) => void;
  addSEOData: (data: SEOAnalysis) => void;
  clearSEOData: () => void;
}

export const useSEOStore = create<SEOStore>((set) => ({
  seoData: [],
  setSEOData: (data) => set({ seoData: data }),
  addSEOData: (data) => set((state) => ({ 
    seoData: [data, ...state.seoData] 
  })),
  clearSEOData: () => set({ seoData: [] }),
}));