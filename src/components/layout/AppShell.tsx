import { Outlet } from 'react-router-dom';

import { OfflineBanner } from './OfflineBanner';
import { Sidebar } from './Sidebar';
import { SkipLink } from './SkipLink';

export function AppShell() {
  return (
    <div className="app-shell">
      <SkipLink />
      <Sidebar />
      <div className="app-column">
        <OfflineBanner />
        <main id="contenido" tabIndex={-1} className="app-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <p>Tektoni · Frontend React que consume la biblioteca tektoni-ui</p>
          <p className="app-footer__meta">TanStack Query · React Hook Form + Zod · PWA</p>
        </footer>
      </div>
    </div>
  );
}
