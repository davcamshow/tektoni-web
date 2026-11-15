import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { useToast } from 'tektoni-ui';

import { useAnnounce } from '../components/a11y/LiveAnnouncer';
import { queryKeys } from '../lib/query-keys';
import {
  acknowledgeAlert,
  createAlert,
  deleteAlert,
  fetchAlerts,
} from '../services/api';
import type {
  Alert,
  AlertFilters,
  AlertsPage,
  CreateAlertInput,
} from '../types/domain';

type AlertsInfiniteData = InfiniteData<AlertsPage, string | null>;
type AlertsSnapshot = Array<[QueryKey, AlertsInfiniteData | undefined]>;

function restoreSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot: AlertsSnapshot | undefined,
): void {
  if (!snapshot) return;
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data);
  }
}

/** Feed de alertas con paginación por cursor (scroll/infinite). */
export function useAlertsInfinite(filters: AlertFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.alerts.infinite(filters),
    queryFn: ({ pageParam }) => fetchAlerts({ cursor: pageParam, ...filters }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // `select` deriva solo lo que la vista necesita de la caché.
    select: (data) => ({
      items: data.pages.flatMap((page) => page.items),
      total: data.pages[0]?.total ?? 0,
    }),
  });
}

/** Crea una alerta con actualización optimista. */
export function useCreateAlert() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const announce = useAnnounce();

  return useMutation({
    mutationFn: (input: CreateAlertInput) => createAlert(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.alerts.all });
      const previous = queryClient.getQueriesData<AlertsInfiniteData>({
        queryKey: queryKeys.alerts.all,
      });

      const optimistic: Alert = {
        id: `temp-${Date.now()}`,
        projectId: input.projectId,
        projectName: input.projectName,
        severity: input.severity,
        title: input.title,
        description: input.description,
        status: 'open',
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueriesData<AlertsInfiniteData>(
        { queryKey: queryKeys.alerts.all },
        (old) => {
          if (!old) return old;
          const pages = old.pages.map((page, index) =>
            index === 0
              ? { ...page, items: [optimistic, ...page.items], total: page.total + 1 }
              : page,
          );
          return { ...old, pages };
        },
      );

      return { previous };
    },
    onError: (error, _input, context) => {
      restoreSnapshot(queryClient, context?.previous);
      const message =
        error instanceof Error ? error.message : 'No se pudo crear la alerta.';
      toast.show({ tone: 'error', title: 'Error al crear', description: message, duration: 15000 });
      announce(`Error al crear la alerta. ${message}`, 'assertive');
    },
    onSuccess: (alert) => {
      toast.show({ tone: 'success', title: 'Alerta creada', description: alert.title });
      announce(`Alerta creada: ${alert.title}`, 'polite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

/** Reconoce una alerta con actualización optimista del estado. */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const announce = useAnnounce();

  return useMutation({
    mutationFn: (id: string) => acknowledgeAlert(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.alerts.all });
      const previous = queryClient.getQueriesData<AlertsInfiniteData>({
        queryKey: queryKeys.alerts.all,
      });

      queryClient.setQueriesData<AlertsInfiniteData>(
        { queryKey: queryKeys.alerts.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((alert) =>
                alert.id === id ? { ...alert, status: 'acknowledged' } : alert,
              ),
            })),
          };
        },
      );

      return { previous };
    },
    onError: (error, _id, context) => {
      restoreSnapshot(queryClient, context?.previous);
      const message =
        error instanceof Error ? error.message : 'No se pudo reconocer la alerta.';
      toast.show({ tone: 'error', title: 'Error al reconocer', description: message, duration: 15000 });
      announce(`Error al reconocer la alerta. ${message}`, 'assertive');
    },
    onSuccess: (alert) => {
      toast.show({ tone: 'success', title: 'Alerta reconocida', description: alert.title });
      announce(`Alerta reconocida: ${alert.title}`, 'polite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

/** Elimina una alerta con actualización optimista y rollback si falla. */
export function useDeleteAlert() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const announce = useAnnounce();

  return useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.alerts.all });
      const previous = queryClient.getQueriesData<AlertsInfiniteData>({
        queryKey: queryKeys.alerts.all,
      });

      queryClient.setQueriesData<AlertsInfiniteData>(
        { queryKey: queryKeys.alerts.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((alert) => alert.id !== id),
              total: Math.max(0, page.total - 1),
            })),
          };
        },
      );

      return { previous };
    },
    onError: (error, _id, context) => {
      restoreSnapshot(queryClient, context?.previous);
      const message =
        error instanceof Error ? error.message : 'No se pudo eliminar la alerta.';
      toast.show({ tone: 'error', title: 'Error al eliminar', description: message, duration: 15000 });
      announce(`Error al eliminar la alerta. ${message}`, 'assertive');
    },
    onSuccess: () => {
      toast.show({ tone: 'success', title: 'Alerta eliminada' });
      announce('Alerta eliminada correctamente.', 'polite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}
