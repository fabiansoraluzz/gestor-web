// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppProviders from './app/AppProviders';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      {/* Contenedor responsive para móvil */}
      <div className="min-h-screen w-full overflow-x-hidden">
        <RouterProvider router={router} />
      </div>
    </AppProviders>
  </React.StrictMode>
);
