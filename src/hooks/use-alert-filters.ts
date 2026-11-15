import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AlertFilters, AlertSeverity, AlertStatus } from '../types/domain';

/**
 * Estado de filtros de alertas. El texto de búsqueda se debounce con un
 * temporizador guardado en un ref (no provoca renders) y los parámetros
 * efectivos se memoizan para mantener estable la queryKey.
 */
export function useAlertFilters() {
  const [status, setStatus] = useState<AlertStatus | 'all'>('all');
  const [severity, setSeverity] = useState<AlertSeverity | 'all'>('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setQuery(search.trim()), 320);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [search]);

  const filters = useMemo<AlertFilters>(
    () => ({ status, severity, q: query }),
    [status, severity, query],
  );

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value as AlertStatus | 'all');
  }, []);

  const handleSeverityChange = useCallback((value: string) => {
    setSeverity(value as AlertSeverity | 'all');
  }, []);

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);
  const clearSearch = useCallback(() => setSearch(''), []);

  return {
    status,
    severity,
    search,
    filters,
    handleStatusChange,
    handleSeverityChange,
    handleSearchChange,
    clearSearch,
  };
}
