import { Button, Icon, Spinner } from 'tektoni-ui';

interface StateViewProps {
  kind: 'loading' | 'empty' | 'error';
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

/** Estado de carga, vacío o error, compuesto con componentes de la librería. */
export function StateView({ kind, message, onRetry, actionLabel, onAction }: StateViewProps) {
  if (kind === 'loading') {
    return (
      <div className="state-view" role="status" aria-live="polite">
        <Spinner size="lg" />
        <p className="state-view__message">{message}</p>
      </div>
    );
  }

  return (
    <div className={kind === 'error' ? 'state-view state-view--error' : 'state-view'}>
      <div className="state-view__icon" aria-hidden="true">
        <Icon name={kind === 'error' ? 'warning' : 'info'} size={26} />
      </div>
      <p className="state-view__message">{message}</p>
      {kind === 'error' && onRetry ? (
        <Button variant="secondary" size="sm" fullWidth={false} onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
      {kind === 'empty' && onAction && actionLabel ? (
        <Button size="sm" fullWidth={false} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
