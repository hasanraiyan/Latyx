import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.jsx';
import { TooltipProvider } from '@/components/ui/tooltip';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <App />
          <Toaster richColors position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
