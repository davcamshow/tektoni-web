import { Dialog } from '../ui/Dialog';
import { CreateAlertForm } from './CreateAlertForm';

interface CreateAlertDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAlertDialog({ open, onClose }: CreateAlertDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nueva alerta de obra"
      description="Registra un hallazgo detectado por la IA o por el equipo en campo."
    >
      <CreateAlertForm onCreated={onClose} onCancel={onClose} />
    </Dialog>
  );
}
