import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useServices } from '../app/ServicesProvider';
import type { Item, RecentEvent, RepairEvent } from '../domain/types';

export type AsyncData<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

function useAsyncData<T>(initial: T, load: () => Promise<T>): AsyncData<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await load());
    } catch {
      setError('Data gagal dimuat');
    } finally {
      setLoading(false);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return {
    data,
    loading,
    error,
    reload: () => {
      void reload();
    },
  };
}

export function useItems(): AsyncData<Item[]> {
  const { repository } = useServices();
  const load = useCallback(() => repository.list(), [repository]);
  return useAsyncData<Item[]>([], load);
}

export function useItem(id: string): AsyncData<Item | null> {
  const { repository } = useServices();
  const load = useCallback(() => repository.get(id), [repository, id]);
  return useAsyncData<Item | null>(null, load);
}

export function useItemEvents(id: string): AsyncData<RepairEvent[]> {
  const { repository } = useServices();
  const load = useCallback(() => repository.eventsFor(id), [repository, id]);
  return useAsyncData<RepairEvent[]>([], load);
}

export function useRecentEvents(limit: number): AsyncData<RecentEvent[]> {
  const { repository } = useServices();
  const load = useCallback(() => repository.recentEvents(limit), [repository, limit]);
  return useAsyncData<RecentEvent[]>([], load);
}
