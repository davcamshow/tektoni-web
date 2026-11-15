import { Alert as AlertBanner } from 'tektoni-ui';

import { useStats } from '../../hooks/use-stats';
import { KpiCard } from './KpiCard';

export function DashboardStats() {
  const query = useStats();

  if (query.isPending) {
    return (
      <section aria-label="Indicadores de la plataforma" aria-busy="true">
        <span className="tk-visually-hidden" role="status">
          Cargando indicadores…
        </span>
        <div className="kpi-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="kpi kpi--skeleton" aria-hidden="true" />
          ))}
        </div>
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AlertBanner
        tone="danger"
        title="No se pudieron cargar los indicadores"
        description="Revisa la conexión e inténtalo de nuevo."
        action={{ label: 'Reintentar', onClick: () => query.refetch() }}
      />
    );
  }

  const data = query.data;

  return (
    <section aria-label="Indicadores de la plataforma">
      <div className="kpi-grid">
        <KpiCard
          label="Proyectos activos"
          value={data.totalProjects}
          hint={`${data.projectsAtRisk} con riesgo`}
        />
        <KpiCard
          label="Alertas abiertas"
          value={data.openAlerts}
          hint={`${data.criticalAlerts} críticas`}
          tone={data.criticalAlerts > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          label="Avance promedio"
          value={`${data.avgProgress}%`}
          hint="Promedio de todas las obras"
        />
        <KpiCard
          label="Alertas totales"
          value={data.totalAlerts}
          hint="Histórico de la plataforma"
        />
      </div>
    </section>
  );
}
