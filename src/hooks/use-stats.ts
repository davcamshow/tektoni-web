import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../lib/query-keys';
import { fetchStats } from '../services/api';

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: fetchStats,
  });
}
