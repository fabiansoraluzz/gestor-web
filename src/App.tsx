import { useState } from 'react'

export default function App() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tailwind OK ✅</h1>
          <p className="text-slate-600">Vite + React + TypeScript</p>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Este proyecto ya está listo para conectar con tu API de Vercel.
          </p>
          <ul className="list-disc pl-5">
            <li>React + TS + Vite</li>
            <li>TailwindCSS v3</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
