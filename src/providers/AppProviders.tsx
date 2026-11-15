import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from 'tektoni-ui';

import { LiveAnnouncerProvider } from '../components/a11y/LiveAnnouncer';
import { queryClient } from '../config/query-client';
import { QueryDevtools } from './QueryDevtools';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LiveAnnouncerProvider>
        <ToastProvider>{children}</ToastProvider>
      </LiveAnnouncerProvider>
      <QueryDevtools />
    </QueryClientProvider>
  );
}
