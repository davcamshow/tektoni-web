import { AnimatePresence } from 'framer-motion';
import { Button } from 'tektoni-ui';

import { useAlertsInfinite } from '../../hooks/use-alerts';
import type { Alert, AlertFilters } from '../../types/domain';
import { StateView } from '../ui/StateView';
import { AlertCard } from './AlertCard';

interface AlertFeedProps {
  filters: AlertFilters;
  onAcknowledge: (id: string) => void;
  onRequestDelete: (alert: Alert) => void;
  acknowledgeId?: string;
  deleteId?: string;
  busy: boolean;
  onClearFilters?: () => void;
}

export function AlertFeed({
  filters,
  onAcknowledge,
  onRequestDelete,
  acknowledgeId,
  deleteId,
  busy,
  onClearFilters,
}: AlertFeedProps) {
  const query = useAlertsInfinite(filters);

  if (query.isPending) {
    return <StateView kind="loading" message="Cargando alertas…" />;
  }

  if (query.isError) {
    return (
      <StateView
        kind="error"
        message={query.error instanceof Error ? query.error.message : 'No se pudieron cargar las alertas.'}
        onRetry={() => query.refetch()}
      />
    );
  }

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  if (items.length === 0) {
    return (
      <StateView
        kind="empty"
        message="No hay alertas que coincidan con el filtro actual."
        actionLabel={onClearFilters ? 'Limpiar filtros' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="feed-region" aria-busy={query.isFetching || busy}>
      <ul className="feed" role="list" aria-label="Listado de alertas">
        <AnimatePresence initial={false}>
          {items.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onRequestDelete={onRequestDelete}
              isAcknowledging={Boolean(acknowledgeId && acknowledgeId === alert.id)}
              isDeleting={Boolean(deleteId && deleteId === alert.id)}
              isBusy={busy}
            />
          ))}
        </AnimatePresence>
      </ul>

      <div className="feed-more">
        {query.hasNextPage ? (
          <Button
            variant="secondary"
            fullWidth={false}
            loading={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
            aria-label="Cargar más alertas"
          >
            Cargar más alertas
          </Button>
        ) : (
          <p className="muted">
            Mostrando {items.length} de {total} alertas.
          </p>
        )}
      </div>
    </div>
  );
}
