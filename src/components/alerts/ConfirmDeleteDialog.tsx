import { Alert as AlertBanner, Button } from 'tektoni-ui';

import type { Alert } from '../../types/domain';
import { Dialog } from '../ui/Dialog';

interface ConfirmDeleteDialogProps {
  alert: Alert | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  alert,
  pending,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={Boolean(alert)}
      onClose={onCancel}
      title="Eliminar alerta"
      description="Esta acción no se puede deshacer."
      hideCloseButton
    >
      <div className="confirm">
        <AlertBanner
          tone="danger"
          title="Vas a eliminar una alerta"
          description={alert ? `“${alert.title}” · ${alert.projectName}` : undefined}
        />
        <p>
          La alerta desaparecerá del panel de inmediato. Si la operación falla, se restaurará
          automáticamente y verás el mensaje de error.
        </p>
        <div className="form-actions">
          <Button variant="secondary" fullWidth={false} onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="danger" fullWidth={false} onClick={onConfirm} loading={pending} disabled={pending}>
            Eliminar alerta
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
