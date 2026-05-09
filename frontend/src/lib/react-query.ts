import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: true,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
