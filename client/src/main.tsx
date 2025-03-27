import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeContextProvider } from './components/ThemeProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <HelmetProvider>
      <ThemeContextProvider>
        <App />
      </ThemeContextProvider>
    </HelmetProvider>
  </BrowserRouter>,
);
