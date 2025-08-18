// src/app/components/PatternPad.tsx
import { useMemo, useRef, useState } from "react";

type Props = {
  size?: number;                 // px
  path: number[];                // índices 0..8
  onChange: (pts: number[]) => void;
  onFinish?: (pts: number[]) => void;
  disabled?: boolean;
};

const GRID = 3;

export default function PatternPad({
  size = 280,
  path,
  onChange,
  onFinish,
  disabled,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);

  const radius = Math.max(14, size / 12);
  const spacing = size / (GRID + 1);

  const nodes = useMemo(
    () =>
      Array.from({ length: GRID * GRID }, (_, i) => {
        const row = Math.floor(i / GRID) + 1;
        const col = (i % GRID) + 1;
        return { i, x: col * spacing, y: row * spacing };
      }),
    [spacing]
  );

  function getIndexFromPointer(clientX: number, clientY: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return -1;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // el más cercano dentro del radio
    let best = -1;
    let bestDist = Infinity;
    nodes.forEach((n) => {
      const dx = x - n.x;
      const dy = y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        best = n.i;
      }
    });
    return bestDist <= radius * 1.1 ? best : -1;
  }

  function start(e: React.PointerEvent) {
    if (disabled) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing(true);
    const idx = getIndexFromPointer(e.clientX, e.clientY);
    if (idx >= 0 && !path.includes(idx)) onChange([...path, idx]);
  }

  function move(e: React.PointerEvent) {
    if (!drawing || disabled) return;
    const idx = getIndexFromPointer(e.clientX, e.clientY);
    if (idx >= 0 && !path.includes(idx)) onChange([...path, idx]);
  }

  function end() {
    if (!drawing) return;
    setDrawing(false);
    onFinish?.(path);
  }

  return (
    <div
      ref={ref}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      style={{ width: size, height: size }}
      className="relative select-none touch-none"
    >
      {/* Líneas */}
      <svg className="absolute inset-0" width={size} height={size}>
        {path.map((p, i) => {
          if (i === 0) return null;
          const a = nodes[path[i - 1]];
          const b = nodes[p];
          return (
            <line
              key={`${a.i}-${b.i}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgb(59 130 246)"      // azul-500
              strokeWidth={6}
              strokeLinecap="round"
              className="transition-all duration-150"
            />
          );
        })}
      </svg>

      {/* Nodos */}
      {nodes.map((n) => {
        const active = path.includes(n.i);
        return (
          <div
            key={n.i}
            style={{
              left: n.x - radius,
              top: n.y - radius,
              width: radius * 2,
              height: radius * 2,
            }}
            className={`absolute rounded-full border-2 grid place-items-center
              ${active ? "bg-blue-500 border-blue-600 scale-105" : "bg-white border-slate-300"}
              transition-transform`}
          >
            <div
              className={`rounded-full ${active ? "bg-white/90" : "bg-slate-300/70"}`}
              style={{ width: radius / 2, height: radius / 2 }}
            />
          </div>
        );
      })}
    </div>
  );
}
