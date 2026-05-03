'use client';

import { createContext, useContext, useState } from 'react';
import type { FilterState } from '@/types';

export const DEFAULT_FILTERS: FilterState = {
  category: null,
  style:    null,
  color:    '#212123',
  search:   '',
};

interface FilterContextValue {
  filters:    FilterState;
  setFilters: (filters: FilterState) => void;
}

const FilterContext = createContext<FilterContextValue>({
  filters:    DEFAULT_FILTERS,
  setFilters: () => {},
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  return useContext(FilterContext);
}
