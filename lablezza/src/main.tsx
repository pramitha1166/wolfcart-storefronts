import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ThemeProvider} from './ThemeProvider.tsx';
import {initTheme} from './theme.ts';
import './index.css';

// Applied before the first paint so the store never flashes the wrong palette.
const theme = initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
