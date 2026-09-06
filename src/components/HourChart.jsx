import { Card, CardTitle } from "./primitives.jsx";

export function HourChart({ byHour, hotHours, hasZone, count }) {
  const max = Math.max(...byHour) || 1;
  const nowH = new Date().getHours();
  const hot = new Set(hotHours);

  return (
    <Card>
      <CardTitle>Patrón por hora del día</CardTitle>
      <div className="flex h-24 items-end gap-[3px]">
        {byHour.map((c, h) => (
          <div
            key={h}
            title={`${h}:00 — ${c} corte${c === 1 ? "" : "s"}`}
            style={{ height: `${Math.max(2, (c / max) * 100)}%` }}
            className={`min-h-[2px] flex-1 rounded-t-sm transition-[height] ${
              hot.has(h) && c > 0 ? "bg-amber" : "bg-line"
            } ${h === nowH ? "outline outline-2 outline-offset-1 outline-ink-mid" : ""}`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[0.68rem] text-ink-dim">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
      <p className="mt-2.5 text-[0.86rem] text-ink-dim">
        {!hasZone
          ? "Elige una urbanización."
          : count < 4
            ? "El histograma se llena a medida que llegan reportes."
            : "Cada barra = cortes que empezaron en esa hora. El recuadro marca la hora actual."}
      </p>
    </Card>
  );
}
