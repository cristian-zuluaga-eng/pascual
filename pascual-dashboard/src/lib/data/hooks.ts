/**
 * Data Provider React Hooks
 *
 * React hooks for consuming data from the data provider system.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { dataProvider } from "./provider";
import { DataState, DataStatus, DataFilter } from "./types";

/**
 * Hook to subscribe to a data source
 */
export function useDataSource<T = unknown>(
  sourceId: string,
  filter?: DataFilter
): DataState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<DataState<T>>(() => {
    const currentState = dataProvider.getState<T>(sourceId);
    return (
      currentState ?? {
        status: "idle" as DataStatus,
        data: null,
        error: null,
        lastUpdated: null,
        isRefreshing: false,
      }
    );
  });

  useEffect(() => {
    const unsubscribe = dataProvider.subscribe(
      sourceId,
      (newState) => setState(newState as DataState<T>),
      filter
    );

    return unsubscribe;
  }, [sourceId, filter]);

  const refetch = useCallback(async () => {
    await dataProvider.fetch(sourceId);
  }, [sourceId]);

  return {
    ...state,
    refetch,
  };
}

/**
 * Hook to get data from multiple sources
 */
export function useMultipleDataSources<T extends Record<string, unknown>>(
  sourceIds: string[]
): {
  data: Partial<T>;
  isLoading: boolean;
  hasError: boolean;
  errors: Record<string, string | null>;
  refetchAll: () => Promise<void>;
} {
  const [states, setStates] = useState<Record<string, DataState>>({});

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    for (const sourceId of sourceIds) {
      const unsubscribe = dataProvider.subscribe(sourceId, (state) => {
        setStates((prev) => ({ ...prev, [sourceId]: state }));
      });
      unsubscribers.push(unsubscribe);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [sourceIds]);

  const data = useMemo(() => {
    const result: Partial<T> = {};
    for (const sourceId of sourceIds) {
      const state = states[sourceId];
      if (state?.data) {
        (result as Record<string, unknown>)[sourceId] = state.data;
      }
    }
    return result;
  }, [states, sourceIds]);

  const isLoading = useMemo(
    () => sourceIds.some((id) => states[id]?.status === "loading"),
    [states, sourceIds]
  );

  const hasError = useMemo(
    () => sourceIds.some((id) => states[id]?.status === "error"),
    [states, sourceIds]
  );

  const errors = useMemo(() => {
    const result: Record<string, string | null> = {};
    for (const sourceId of sourceIds) {
      result[sourceId] = states[sourceId]?.error ?? null;
    }
    return result;
  }, [states, sourceIds]);

  const refetchAll = useCallback(async () => {
    await Promise.all(sourceIds.map((id) => dataProvider.fetch(id)));
  }, [sourceIds]);

  return { data, isLoading, hasError, errors, refetchAll };
}

/**
 * Hook to set data in a source (for local state management)
 */
export function useDataSetter<T = unknown>(sourceId: string): (data: T) => void {
  return useCallback(
    (data: T) => {
      dataProvider.setData(sourceId, data);
    },
    [sourceId]
  );
}

/**
 * Hook for computed/derived data
 */
export function useDerivedData<TInput, TOutput>(
  sourceId: string,
  deriveFn: (data: TInput | null) => TOutput,
  deps: React.DependencyList = []
): TOutput {
  const { data } = useDataSource<TInput>(sourceId);

  return useMemo(
    () => deriveFn(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, ...deps]
  );
}

/**
 * Hook for data source events
 */
export function useDataEvents(
  callback: (event: { type: string; sourceId: string; timestamp: number; payload?: unknown }) => void
): void {
  useEffect(() => {
    const unsubscribe = dataProvider.onEvent(callback);
    return unsubscribe;
  }, [callback]);
}

/**
 * Hook to check if all sources are ready
 */
export function useDataReady(sourceIds: string[]): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkReady = () => {
      const allReady = sourceIds.every((id) => {
        const state = dataProvider.getState(id);
        return state?.status === "success";
      });
      setReady(allReady);
    };

    const unsubscribers = sourceIds.map((id) =>
      dataProvider.subscribe(id, checkReady)
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [sourceIds]);

  return ready;
}
