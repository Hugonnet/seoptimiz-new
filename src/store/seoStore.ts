import { create } from 'zustand';

export interface SEOData {
  id: string;
  url: string;
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
  date: string;
}

interface SEOStore {
  seoData: SEOData[];
  addSEOData: (data: Omit<SEOData, "id" | "date">) => void;
}

export const useSEOStore = create<SEOStore>()((set) => ({
  seoData: [],
  addSEOData: (data) => set((state) => ({
    seoData: [
      ...state.seoData,
      {
        ...data,
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
      },
    ],
  })),
}));