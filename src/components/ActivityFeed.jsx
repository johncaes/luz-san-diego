import { Card, CardTitle } from "./primitives.jsx";
import { relTime } from "../lib/format.js";

export function ActivityFeed({ events, hasZone }) {
  const rows = [...events].sort((a, b) => b.ts - a.ts).slice(0, 12);

  return (
    <Card>
      <CardTitle>Actividad reciente</CardTitle>
      {!hasZone ? (
        <p className="text-[0.86rem] text-ink-dim">Elige una urbanización.</p>
      ) : rows.length === 0 ? (
        <p className="text-[0.86rem] text-ink-dim">
          Sin reportes en esta urbanización todavía.
        </p>
      ) : (
        <ul className="flex flex-col">
          {rows.map((e, i) => (
            <li
              key={`${e.ts}-${i}`}
              className="flex items-center gap-2.5 border-t border-line-soft py-2.5 text-[0.88rem] first:border-t-0"
            >
              <span
                className={`h-[7px] w-[7px] shrink-0 rounded-full ${
                  e.type === "off" ? "bg-off" : "bg-on"
                }`}
              />
              {e.type === "off" ? "Se fue la luz" : "Volvió la luz"}
              <span className="ml-auto font-mono text-[0.78rem] text-ink-dim">
                {relTime(e.ts)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
