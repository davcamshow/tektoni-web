import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import 'tektoni-ui/styles.css';
import './index.css';

import { App } from './App';
import { AppProviders } from './providers/AppProviders';

registerSW({ immediate: true });

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el contenedor #root.');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
