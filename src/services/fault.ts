const FAULT_KEY = 'tektoni-web.fault-mode';

/**
 * Modo de prueba: cuando está activo, las operaciones de escritura del
 * servicio mock fallan a propósito. Sirve para demostrar de forma determinista
 * la actualización optimista, el rollback y el feedback de error.
 */
export function isFaultMode(): boolean {
  try {
    return localStorage.getItem(FAULT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setFaultMode(enabled: boolean): void {
  try {
    localStorage.setItem(FAULT_KEY, enabled ? '1' : '0');
  } catch {
    /* ignorar entornos sin almacenamiento */
  }
}
