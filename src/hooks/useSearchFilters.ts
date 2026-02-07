import { create } from "zustand";

export interface SearchFilters {
  query: string;
  category: string | null;
  isOpen: boolean;
  minRating: number | null;
  maxDistance: number | null; // km
  tags: string[]; // indoor, outdoor, free, kid-friendly, etc.
}

interface SearchFiltersState {
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  setMinRating: (rating: number | null) => void;
  setMaxDistance: (distance: number | null) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
}

const initialFilters: SearchFilters = {
  query: "",
  category: null,
  isOpen: false,
  minRating: null,
  maxDistance: null,
  tags: [],
};

export const useSearchFilters = create<SearchFiltersState>((set) => ({
  filters: initialFilters,
  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query } })),
  setCategory: (category) => set((state) => ({ filters: { ...state.filters, category } })),
  setIsOpen: (isOpen) => set((state) => ({ filters: { ...state.filters, isOpen } })),
  setMinRating: (minRating) => set((state) => ({ filters: { ...state.filters, minRating } })),
  setMaxDistance: (maxDistance) => set((state) => ({ filters: { ...state.filters, maxDistance } })),
  toggleTag: (tag) =>
    set((state) => {
      const tags = state.filters.tags.includes(tag)
        ? state.filters.tags.filter((t) => t !== tag)
        : [...state.filters.tags, tag];
      return { filters: { ...state.filters, tags } };
    }),
  clearFilters: () => set({ filters: initialFilters }),
}));
