import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppProviders from './app/AppProviders';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={2500}
        theme="light"       // "light" | "dark" | "system"
      />
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
