"use client";

import { useState, useMemo, useCallback } from "react";

// ============================================================================
// USE FILTERED DATA - Hook para filtrar y buscar en listas
// ============================================================================

interface UseFilteredDataOptions<T> {
  /** Campo(s) a buscar. Puede ser string o array de strings */
  searchFields: keyof T | (keyof T)[];
  /** Función personalizada para extraer texto de búsqueda */
  searchExtractor?: (item: T) => string;
  /** Valor inicial del filtro de categoría */
  initialFilter?: string;
  /** Valor inicial de búsqueda */
  initialSearch?: string;
}

interface UseFilteredDataReturn<T> {
  /** Datos filtrados */
  filteredData: T[];
  /** Valor actual del filtro */
  filter: string;
  /** Setter para el filtro */
  setFilter: (filter: string) => void;
  /** Valor actual de búsqueda */
  search: string;
  /** Setter para búsqueda */
  setSearch: (search: string) => void;
  /** Resetear filtros */
  resetFilters: () => void;
  /** Cantidad de resultados */
  resultCount: number;
  /** Cantidad total de items */
  totalCount: number;
}

/**
 * Hook para filtrar y buscar en arrays de datos
 *
 * @example
 * ```tsx
 * const { filteredData, filter, setFilter, search, setSearch } = useFilteredData(
 *   threats,
 *   {
 *     searchFields: ["title", "description"],
 *     initialFilter: "all",
 *   }
 * );
 *
 * // Filtrar por categoría
 * const filtered = filteredData.filter(item =>
 *   filter === "all" || item.category === filter
 * );
 * ```
 */
export function useFilteredData<T>(
  data: T[],
  options: UseFilteredDataOptions<T>
): UseFilteredDataReturn<T> {
  const {
    searchFields,
    searchExtractor,
    initialFilter = "all",
    initialSearch = "",
  } = options;

  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState(initialSearch);

  // Función para extraer texto de búsqueda de un item
  const getSearchableText = useCallback(
    (item: T): string => {
      if (searchExtractor) {
        return searchExtractor(item);
      }

      const fields = Array.isArray(searchFields) ? searchFields : [searchFields];
      return fields
        .map((field) => {
          const value = item[field];
          return typeof value === "string" ? value : String(value ?? "");
        })
        .join(" ");
    },
    [searchFields, searchExtractor]
  );

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }

    const searchLower = search.toLowerCase().trim();
    return data.filter((item) => {
      const searchableText = getSearchableText(item).toLowerCase();
      return searchableText.includes(searchLower);
    });
  }, [data, search, getSearchableText]);

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFilter(initialFilter);
    setSearch(initialSearch);
  }, [initialFilter, initialSearch]);

  return {
    filteredData,
    filter,
    setFilter,
    search,
    setSearch,
    resetFilters,
    resultCount: filteredData.length,
    totalCount: data.length,
  };
}

// ============================================================================
// USE CATEGORY FILTER - Hook especializado para filtros por categoría
// ============================================================================

interface FilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface UseCategoryFilterOptions<T extends string, D> {
  /** Campo que contiene la categoría */
  categoryField: keyof D;
  /** Opciones de filtro disponibles */
  options: FilterOption<T>[];
  /** Valor inicial */
  initialValue?: T;
  /** Incluir opción "Todos" automáticamente */
  includeAll?: boolean;
}

interface UseCategoryFilterReturn<T extends string, D> {
  /** Datos filtrados */
  filteredData: D[];
  /** Valor actual del filtro */
  activeFilter: T;
  /** Setter para el filtro */
  setActiveFilter: (filter: T) => void;
  /** Opciones con conteo actualizado */
  optionsWithCount: FilterOption<T>[];
  /** Está filtrando (no es "all") */
  isFiltering: boolean;
}

/**
 * Hook para filtrar por categoría con conteo automático
 *
 * @example
 * ```tsx
 * const { filteredData, activeFilter, setActiveFilter, optionsWithCount } = useCategoryFilter(
 *   threats,
 *   {
 *     categoryField: "severity",
 *     options: [
 *       { value: "critical", label: "Crítico" },
 *       { value: "high", label: "Alto" },
 *       { value: "medium", label: "Medio" },
 *     ],
 *     includeAll: true,
 *   }
 * );
 * ```
 */
export function useCategoryFilter<T extends string, D>(
  data: D[],
  options: UseCategoryFilterOptions<T, D>
): UseCategoryFilterReturn<T | "all", D> {
  const {
    categoryField,
    options: filterOptions,
    initialValue = "all" as T,
    includeAll = true,
  } = options;

  const [activeFilter, setActiveFilter] = useState<T | "all">(initialValue);

  // Calcular conteos por categoría
  const counts = useMemo(() => {
    const countMap: Record<string, number> = { all: data.length };

    data.forEach((item) => {
      const category = String(item[categoryField]);
      countMap[category] = (countMap[category] || 0) + 1;
    });

    return countMap;
  }, [data, categoryField]);

  // Opciones con conteo
  const optionsWithCount = useMemo(() => {
    const opts: FilterOption<T | "all">[] = [];

    if (includeAll) {
      opts.push({
        value: "all",
        label: "Todos",
        count: counts.all,
      });
    }

    filterOptions.forEach((opt) => {
      opts.push({
        ...opt,
        count: counts[opt.value] || 0,
      });
    });

    return opts;
  }, [filterOptions, counts, includeAll]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (activeFilter === "all") {
      return data;
    }

    return data.filter((item) => String(item[categoryField]) === activeFilter);
  }, [data, activeFilter, categoryField]);

  return {
    filteredData,
    activeFilter,
    setActiveFilter,
    optionsWithCount,
    isFiltering: activeFilter !== "all",
  };
}

// ============================================================================
// USE SEARCH - Hook simple para búsqueda de texto
// ============================================================================

interface UseSearchOptions {
  /** Debounce en ms */
  debounce?: number;
  /** Mínimo de caracteres para buscar */
  minLength?: number;
}

interface UseSearchReturn {
  /** Valor de búsqueda */
  searchValue: string;
  /** Valor debounced */
  debouncedValue: string;
  /** Setter */
  setSearchValue: (value: string) => void;
  /** Limpiar búsqueda */
  clearSearch: () => void;
  /** Está buscando (tiene valor) */
  isSearching: boolean;
}

/**
 * Hook simple para manejo de búsqueda con debounce
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { debounce = 300, minLength = 0 } = options;

  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  // Debounce effect
  useMemo(() => {
    const timer = setTimeout(() => {
      if (searchValue.length >= minLength) {
        setDebouncedValue(searchValue);
      } else {
        setDebouncedValue("");
      }
    }, debounce);

    return () => clearTimeout(timer);
  }, [searchValue, debounce, minLength]);

  const clearSearch = useCallback(() => {
    setSearchValue("");
    setDebouncedValue("");
  }, []);

  return {
    searchValue,
    debouncedValue,
    setSearchValue,
    clearSearch,
    isSearching: searchValue.length > 0,
  };
}

export default useFilteredData;
