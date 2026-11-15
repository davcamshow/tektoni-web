import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button, Navbar, Switch, useToast } from 'tektoni-ui';

import { isFaultMode, setFaultMode } from '../services/fault';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function SettingsPage() {
  const toast = useToast();
  const reduceMotion = useReducedMotion();
  const [fault, setFault] = useState<boolean>(() => isFaultMode());
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleFaultChange = (checked: boolean) => {
    setFaultMode(checked);
    setFault(checked);
    toast.show({
      tone: checked ? 'warning' : 'success',
      title: checked ? 'Modo de prueba activado' : 'Modo de prueba desactivado',
      description: checked
        ? 'Las escrituras fallarán para demostrar el rollback.'
        : 'Las escrituras vuelven a funcionar con normalidad.',
    });
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') {
      toast.show({
        tone: 'success',
        title: 'Instalando Tektoni',
        description: 'La app quedará disponible como PWA.',
      });
    }
    setInstallEvent(null);
  };

  return (
    <>
      <Navbar title="Ajustes" subtitle="Modo de prueba, PWA y accesibilidad" back={false} />

      <div className="page page--narrow">
        <section className="settings-section" aria-labelledby="fault-heading">
          <h2 id="fault-heading">Modo de prueba</h2>
          <p className="muted">
            Fuerza errores de red en las operaciones de escritura para demostrar las mutaciones
            optimistas y su rollback.
          </p>
          <div className="switch-row">
            <span className="switch-row__label">Forzar error de red al escribir</span>
            <Switch
              checked={fault}
              onChange={handleFaultChange}
              label="Forzar error de red al escribir"
            />
          </div>
        </section>

        <section className="settings-section" aria-labelledby="pwa-heading">
          <h2 id="pwa-heading">Aplicación web progresiva</h2>
          <p className="muted">
            La app incluye manifiesto, service worker con precarga del shell y funciona sin
            conexión con los datos guardados.
          </p>
          {installEvent ? (
            <Button onClick={handleInstall} fullWidth={false}>
              Instalar Tektoni
            </Button>
          ) : (
            <p className="muted">
              Si el navegador lo permite, aparecerá el botón de instalación. En escritorio también
              puedes instalarla desde el icono de la barra de direcciones.
            </p>
          )}
        </section>

        <section className="settings-section" aria-labelledby="a11y-heading">
          <h2 id="a11y-heading">Accesibilidad</h2>
          <ul className="plain-list">
            <li>
              Reducción de movimiento {reduceMotion ? 'activa' : 'inactiva'} (prefers-reduced-motion).
            </li>
            <li>Navegación completa por teclado, foco visible y diálogos con atrapado de foco.</li>
            <li>Anuncios de éxito y error mediante regiones aria-live.</li>
          </ul>
        </section>

        <section className="settings-section" aria-labelledby="lib-heading">
          <h2 id="lib-heading">Componentes de tektoni-ui usados</h2>
          <p className="muted">
            Button, Input, Select, Switch, Alert, Toast, Tabs, SearchBar, Navbar, Spinner e Icon.
          </p>
        </section>
      </div>
    </>
  );
}
