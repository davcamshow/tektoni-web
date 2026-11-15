import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';
import { Alert as AlertBanner, Button } from 'tektoni-ui';

import { formatRelative } from '../../lib/format';
import type { Alert } from '../../types/domain';

const SEVERITY_TONE = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
} as const;

const SEVERITY_LABEL = {
  critical: 'Crítica',
  warning: 'Advertencia',
  info: 'Informativa',
} as const;

const STATUS_LABEL = {
  open: 'Abierta',
  acknowledged: 'Reconocida',
  resolved: 'Resuelta',
} as const;

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onRequestDelete: (alert: Alert) => void;
  isAcknowledging: boolean;
  isDeleting: boolean;
  isBusy: boolean;
}

/**
 * Tarjeta de alerta memoizada. Compone el componente `Alert` de la librería y
 * añade metadatos y acciones. Se re-renderiza solo cuando cambian sus props.
 */
export const AlertCard = memo(function AlertCard({
  alert,
  onAcknowledge,
  onRequestDelete,
  isAcknowledging,
  isDeleting,
  isBusy,
}: AlertCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: 24 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
      className="alert-card"
    >
      <AlertBanner
        tone={SEVERITY_TONE[alert.severity]}
        title={alert.title}
        description={alert.description}
      />

      <div className="alert-card__meta">
        <span className={`chip chip--${alert.severity}`}>{SEVERITY_LABEL[alert.severity]}</span>
        <span className={`chip chip--status-${alert.status}`}>{STATUS_LABEL[alert.status]}</span>
        <span className="alert-card__project">{alert.projectName}</span>
        <time dateTime={alert.createdAt}>{formatRelative(alert.createdAt)}</time>
      </div>

      <div className="alert-card__actions">
        <Button
          variant="secondary"
          size="sm"
          fullWidth={false}
          disabled={alert.status !== 'open' || isBusy}
          loading={isAcknowledging}
          onClick={() => onAcknowledge(alert.id)}
          aria-label={`Reconocer la alerta: ${alert.title}`}
        >
          {alert.status === 'open' ? 'Reconocer' : STATUS_LABEL[alert.status]}
        </Button>
        <Button
          variant="danger"
          size="sm"
          fullWidth={false}
          disabled={isBusy}
          loading={isDeleting}
          onClick={() => onRequestDelete(alert)}
          aria-label={`Eliminar la alerta: ${alert.title}`}
        >
          Eliminar
        </Button>
      </div>
    </motion.li>
  );
});
