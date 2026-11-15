import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useToast } from 'tektoni-ui';

import { useAnnounce } from '../components/a11y/LiveAnnouncer';
import { queryKeys } from '../lib/query-keys';
import { fetchProjects, updateProjectStatus } from '../services/api';
import type { Paginated, Project, ProjectStatus } from '../types/domain';

type ProjectsSnapshot = Array<[QueryKey, Paginated<Project> | undefined]>;

export function useProjects(page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.projects.page(page, pageSize),
    queryFn: () => fetchProjects({ page, pageSize }),
    // Mantiene la página anterior visible mientras llega la siguiente.
    placeholderData: (previous) => previous,
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const announce = useAnnounce();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      updateProjectStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });
      const previous = queryClient.getQueriesData<Paginated<Project>>({
        queryKey: queryKeys.projects.all,
      });
      const snapshot: ProjectsSnapshot = previous;

      queryClient.setQueriesData<Paginated<Project>>(
        { queryKey: queryKeys.projects.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((project) =>
              project.id === id
                ? { ...project, status, updatedAt: new Date().toISOString() }
                : project,
            ),
          };
        },
      );

      return { previous: snapshot };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar el proyecto.';
      toast.show({ tone: 'error', title: 'Error al actualizar', description: message, duration: 15000 });
      announce(`Error al actualizar el proyecto. ${message}`, 'assertive');
    },
    onSuccess: (project) => {
      toast.show({ tone: 'success', title: 'Estado actualizado', description: project.name });
      announce(`Estado del proyecto ${project.name} actualizado.`, 'polite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}
