import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type AnnounceTone = 'polite' | 'assertive';

interface AnnouncerValue {
  announce: (message: string, tone?: AnnounceTone) => void;
}

const AnnouncerContext = createContext<AnnouncerValue | null>(null);

/**
 * Región de anuncios para lectores de pantalla. Los mensajes de éxito se
 * anuncian de forma cortés (role="status") y los errores de forma asertiva
 * (role="alert"), sin requerir interacción adicional.
 */
export function LiveAnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const timer = useRef<number | null>(null);

  const announce = useCallback((message: string, tone: AnnounceTone = 'polite') => {
    if (timer.current) window.clearTimeout(timer.current);
    // Se limpia y se vuelve a asignar para forzar el anuncio si el texto se repite.
    if (tone === 'assertive') setAssertive('');
    else setPolite('');

    timer.current = window.setTimeout(() => {
      if (tone === 'assertive') setAssertive(message);
      else setPolite(message);
    }, 50);
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <div className="tk-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="tk-visually-hidden" role="alert" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce(): AnnouncerValue['announce'] {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnounce debe usarse dentro de <LiveAnnouncerProvider>.');
  }
  return context.announce;
}
