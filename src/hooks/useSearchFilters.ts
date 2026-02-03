import { create } from "zustand";

export interface SearchFilters {
  query: string;
  category: string | null;
  isOpen: boolean;
  minRating: number | null;
}

interface SearchFiltersState {
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  setMinRating: (rating: number | null) => void;
  clearFilters: () => void;
}

const initialFilters: SearchFilters = {
  query: "",
  category: null,
  isOpen: false,
  minRating: null,
};

export const useSearchFilters = create<SearchFiltersState>((set) => ({
  filters: initialFilters,
  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query } })),
  setCategory: (category) => set((state) => ({ filters: { ...state.filters, category } })),
  setIsOpen: (isOpen) => set((state) => ({ filters: { ...state.filters, isOpen } })),
  setMinRating: (minRating) => set((state) => ({ filters: { ...state.filters, minRating } })),
  clearFilters: () => set({ filters: initialFilters }),
}));
