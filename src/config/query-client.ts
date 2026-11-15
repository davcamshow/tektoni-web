import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../services/api';

/**
 * Configuración central de TanStack Query.
 * - staleTime: los datos se consideran frescos 30 s para evitar refetch agresivo.
 * - refetchOnWindowFocus: desactivado; el panel se actualiza por invalidación
 *   tras cada mutación, lo que da una experiencia predecible.
 * - retry: no se reintentan errores 4xx (validación/permiso) y solo 2 veces
 *   los errores de red/servidor.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
