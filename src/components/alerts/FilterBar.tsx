import { useMemo } from 'react';
import { SearchBar, Tabs, type TabItem } from 'tektoni-ui';

import { Select } from '../ui/Select';
import type { AlertSeverity, AlertStatus } from '../../types/domain';

interface FilterBarProps {
  status: AlertStatus | 'all';
  onStatusChange: (value: string) => void;
  severity: AlertSeverity | 'all';
  onSeverityChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export function FilterBar({
  status,
  onStatusChange,
  severity,
  onSeverityChange,
  search,
  onSearchChange,
  onClearSearch,
}: FilterBarProps) {
  const statusTabs = useMemo<TabItem[]>(
    () => [
      { value: 'all', label: 'Todas' },
      { value: 'open', label: 'Abiertas' },
      { value: 'acknowledged', label: 'Reconocidas' },
    ],
    [],
  );

  const severityOptions = useMemo(
    () => [
      { value: 'all', label: 'Todas las severidades' },
      { value: 'critical', label: 'Críticas' },
      { value: 'warning', label: 'Advertencias' },
      { value: 'info', label: 'Informativas' },
    ],
    [],
  );

  return (
    <section className="filter-bar" aria-label="Filtros de alertas">
      <div role="group" aria-label="Filtrar por estado">
        <Tabs tabs={statusTabs} value={status} onChange={onStatusChange} variant="pill" />
      </div>
      <div className="filter-bar__row">
        <div className="filter-bar__select">
          <Select
            aria-label="Filtrar por severidad"
            value={severity}
            onChange={onSeverityChange}
            options={severityOptions}
          />
        </div>
        <SearchBar
          className="searchbar--compact"
          value={search}
          onChange={onSearchChange}
          onClear={onClearSearch}
          placeholder="Buscar por título, proyecto o descripción…"
          aria-label="Buscar alertas"
        />
      </div>
    </section>
  );
}
