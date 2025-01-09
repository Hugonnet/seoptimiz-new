import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SEOData {
  id: string;
  url: string;
  company: string;
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
  date: string;
}

interface SEOStore {
  seoData: SEOData[];
  addSEOData: (data: Omit<SEOData, "id" | "date">) => void;
  resetSEOData: () => void;
}

export const useSEOStore = create<SEOStore>()(
  persist(
    (set) => ({
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
      resetSEOData: () => set({ seoData: [] }),
    }),
    {
      name: 'seo-storage',
    }
  )
);