import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useId, useRef } from 'react';
import { Icon } from 'tektoni-ui';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** En confirmaciones destructivas conviene que el foco vaya a la acción segura. */
  hideCloseButton?: boolean;
}

/**
 * Diálogo basado en el elemento nativo <dialog>, que aporta atrapado de foco,
 * cierre con Escape y semántica modal. Se compone con componentes de la
 * librería y devuelve el foco al elemento que lo abrió.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  hideCloseButton = false,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();

  const restoreFocus = useCallback(() => {
    const target = previousFocus.current;
    if (target && document.contains(target)) target.focus();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) dialog.showModal();
      requestAnimationFrame(() => {
        const target =
          dialog.querySelector<HTMLElement>('[data-autofocus]') ??
          dialog.querySelector<HTMLElement>('input, select, textarea') ??
          dialog.querySelector<HTMLElement>('button');
        target?.focus();
      });
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      restoreFocus();
      onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose, restoreFocus]);

  return (
    <dialog
      ref={dialogRef}
      className="tk-dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      {open ? (
        <motion.div
          className="tk-dialog__panel"
          initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
        >
          <header className="tk-dialog__header">
            <div>
              <h2 id={titleId} className="tk-dialog__title">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="tk-dialog__description">
                  {description}
                </p>
              ) : null}
            </div>
            {hideCloseButton ? null : (
              <button
                type="button"
                className="icon-button"
                aria-label="Cerrar diálogo"
                onClick={() => dialogRef.current?.close()}
              >
                <Icon name="close" size={20} />
              </button>
            )}
          </header>
          <div className="tk-dialog__body">{children}</div>
        </motion.div>
      ) : null}
    </dialog>
  );
}
