import { Alert } from 'tektoni-ui';

import { useOnlineStatus } from '../../hooks/use-online-status';

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="offline-banner">
      <Alert
        tone="warning"
        title="Sin conexión"
        description="Estás viendo los datos guardados. Los cambios se reintentarán cuando vuelva la conexión."
      />
    </div>
  );
}
