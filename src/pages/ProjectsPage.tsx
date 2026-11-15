import { useCallback, useEffect, useState } from 'react';
import { Navbar } from 'tektoni-ui';

import { Pagination } from '../components/projects/Pagination';
import { ProjectsTable } from '../components/projects/ProjectsTable';
import { StateView } from '../components/ui/StateView';
import { useProjects, useUpdateProjectStatus } from '../hooks/use-projects';
import type { ProjectStatus } from '../types/domain';

const PAGE_SIZE = 6;

export function ProjectsPage() {
  const [page, setPage] = useState(1);
  const query = useProjects(page, PAGE_SIZE);
  const update = useUpdateProjectStatus();

  const handleStatusChange = useCallback(
    (id: string, status: ProjectStatus) => {
      update.mutate({ id, status });
    },
    [update.mutate],
  );

  const handlePrev = useCallback(() => setPage((current) => Math.max(1, current - 1)), []);
  const handleNext = useCallback(() => setPage((current) => current + 1), []);

  useEffect(() => {
    if (query.data && page > query.data.totalPages) {
      setPage(query.data.totalPages);
    }
  }, [query.data, page]);

  const pendingId = update.isPending ? update.variables?.id : undefined;

  return (
    <>
      <Navbar
        title="Proyectos"
        subtitle="Avance y estado de las obras activas"
        back={false}
        right={<span className="nav-hint">{query.data?.total ?? '—'} obras</span>}
      />

      <div className="page">
        <p className="page__lead">
          Cambia el estado directamente en la tabla: se aplica de inmediato (actualización
          optimista) y se revierte si el servidor falla.
        </p>

        {query.isPending ? (
          <StateView kind="loading" message="Cargando proyectos…" />
        ) : query.isError ? (
          <StateView
            kind="error"
            message={
              query.error instanceof Error
                ? query.error.message
                : 'No se pudieron cargar los proyectos.'
            }
            onRetry={() => query.refetch()}
          />
        ) : (
          <>
            <ProjectsTable
              projects={query.data.items}
              onStatusChange={handleStatusChange}
              pendingId={pendingId}
            />
            <Pagination
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              pageSize={PAGE_SIZE}
              isFetching={query.isFetching}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </>
        )}
      </div>
    </>
  );
}
