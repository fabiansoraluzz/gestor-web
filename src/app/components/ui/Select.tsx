// src/app/components/ui/Select.tsx
import * as React from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";

export type SelectOption = { value: string | number; label: string };

export type SelectProps = {
  value: string | number | "";
  onChange: (value: string | number | "") => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
  className = "",
  disabled = false,
  id,
  name,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => String(o.value) === String(value));

  // Cerrar al hacer click fuera
  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Toggle con teclado
  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={[
          "w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 py-2.5 text-left text-sm",
          "outline-none transition",
          "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
          "disabled:bg-slate-100 disabled:text-slate-400",
        ].join(" ")}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon
          className="pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className={[
            "absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg",
            "ring-1 ring-black/5 overflow-hidden",
          ].join(" ")}
        >
          <ul className="max-h-60 overflow-y-auto py-1 text-sm">
            {options.map((opt) => {
              const isSel = String(opt.value) === String(value);
              return (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={[
                      "w-full px-3 py-2 flex items-center justify-between",
                      isSel
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-slate-50 text-slate-700",
                    ].join(" ")}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSel && <CheckIcon className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
            {options.length === 0 && (
              <li className="px-3 py-2 text-slate-400">Sin opciones</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
