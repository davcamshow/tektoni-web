import { useCallback, useState } from 'react';
import { Button, Navbar } from 'tektoni-ui';

import { AlertFeed } from '../components/alerts/AlertFeed';
import { ConfirmDeleteDialog } from '../components/alerts/ConfirmDeleteDialog';
import { CreateAlertDialog } from '../components/alerts/CreateAlertDialog';
import { FilterBar } from '../components/alerts/FilterBar';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { useAcknowledgeAlert, useDeleteAlert } from '../hooks/use-alerts';
import { useAlertFilters } from '../hooks/use-alert-filters';
import type { Alert } from '../types/domain';

export function DashboardPage() {
  const {
    status,
    severity,
    search,
    filters,
    handleStatusChange,
    handleSeverityChange,
    handleSearchChange,
    clearSearch,
  } = useAlertFilters();

  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Alert | null>(null);

  const acknowledge = useAcknowledgeAlert();
  const remove = useDeleteAlert();

  const handleAcknowledge = useCallback(
    (id: string) => {
      acknowledge.mutate(id);
    },
    [acknowledge.mutate],
  );

  const handleRequestDelete = useCallback((alert: Alert) => {
    setPendingDelete(alert);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete.id, {
      onSettled: () => setPendingDelete(null),
    });
  }, [pendingDelete, remove.mutate]);

  const handleClearFilters = useCallback(() => {
    handleStatusChange('all');
    handleSeverityChange('all');
    clearSearch();
  }, [handleStatusChange, handleSeverityChange, clearSearch]);

  const busy = acknowledge.isPending || remove.isPending;
  const acknowledgeId = acknowledge.isPending ? acknowledge.variables : undefined;
  const deleteId = remove.isPending ? remove.variables : undefined;

  return (
    <>
      <Navbar
        title="Panel de control"
        subtitle="Alertas de IA y avance de obra"
        back={false}
        right={
          <Button
            size="sm"
            fullWidth={false}
            onClick={() => setCreateOpen(true)}
            aria-label="Registrar nueva alerta"
          >
            Nueva alerta
          </Button>
        }
      />

      <div className="page">
        <DashboardStats />

        <section className="page__section" aria-labelledby="alerts-heading">
          <div className="section-heading">
            <h2 id="alerts-heading">Alertas de obra</h2>
            <p className="muted">
              Reconoce o elimina alertas; los cambios se aplican al instante y se revierten si
              el servidor falla.
            </p>
          </div>

          <FilterBar
            status={status}
            onStatusChange={handleStatusChange}
            severity={severity}
            onSeverityChange={handleSeverityChange}
            search={search}
            onSearchChange={handleSearchChange}
            onClearSearch={clearSearch}
          />

          <AlertFeed
            filters={filters}
            onAcknowledge={handleAcknowledge}
            onRequestDelete={handleRequestDelete}
            acknowledgeId={acknowledgeId}
            deleteId={deleteId}
            busy={busy}
            onClearFilters={handleClearFilters}
          />
        </section>
      </div>

      <CreateAlertDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <ConfirmDeleteDialog
        alert={pendingDelete}
        pending={remove.isPending}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
