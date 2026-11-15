import type { AlertFilters } from '../types/domain';

/**
 * Claves de consulta centralizadas y serializables. Toda query/mutation
 * reutiliza estas claves para invalidar y actualizar la caché de forma
 * consistente.
 */
export const queryKeys = {
  stats: ['stats'] as const,
  alerts: {
    all: ['alerts'] as const,
    infiniteRoot: ['alerts', 'infinite'] as const,
    infinite: (filters: AlertFilters) => ['alerts', 'infinite', filters] as const,
  },
  projects: {
    all: ['projects'] as const,
    pageRoot: ['projects', 'page'] as const,
    page: (page: number, pageSize: number) => ['projects', 'page', page, pageSize] as const,
  },
} as const;
