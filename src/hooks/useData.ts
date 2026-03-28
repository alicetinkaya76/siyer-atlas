import { useQuery, useQueryClient } from '@tanstack/react-query';

const BASE_PATH = import.meta.env.BASE_URL + 'data';

/** Fetch JSON data from public/data/ with TanStack Query caching */
export function useData<T>(key: string, enabled = true) {
  return useQuery<T>({
    queryKey: ['data', key],
    queryFn: async () => {
      const url = key.startsWith('/') ? key : `${BASE_PATH}/${key}.json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load ${key}: ${res.status}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour — static data
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled,
    retry: 2,
  });
}

/** Prefetch data for upcoming navigation */
export function usePrefetch() {
  const queryClient = useQueryClient();

  return (key: string) => {
    queryClient.prefetchQuery({
      queryKey: ['data', key],
      queryFn: async () => {
        const url = key.startsWith('/') ? key : `${BASE_PATH}/${key}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to prefetch ${key}`);
        return res.json();
      },
      staleTime: 1000 * 60 * 60,
    });
  };
}

/** Fetch museum category data */
export function useMuseumData(category: string, enabled = true) {
  return useData(`museum/${category}`, enabled);
}
