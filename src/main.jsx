import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { UiProvider } from '@/context/UiContext';
import App from './App';
import './styles/index.css';
import './styles/polish.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <UiProvider>
          <App />
        </UiProvider>
      </AppProvider>
    </HashRouter>
  </StrictMode>,
);
