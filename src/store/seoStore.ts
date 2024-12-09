import { create } from 'zustand';

export interface SEOData {
  id: string;
  url: string;
  currentTitle: string;
  suggestedTitle: string;
  currentDescription: string;
  suggestedDescription: string;
  currentH1: string;
  suggestedH1: string;
  currentH2: string;
  suggestedH2: string;
  currentH3: string;
  suggestedH3: string;
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