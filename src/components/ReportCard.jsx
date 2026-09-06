import { useState } from "react";
import { Card, CardTitle } from "./primitives.jsx";

function nowHHMM() {
  const n = new Date();
  return (
    String(n.getHours()).padStart(2, "0") +
    ":" +
    String(n.getMinutes()).padStart(2, "0")
  );
}

function resolveTs(hhmm, backDays) {
  const d = new Date();
  if (/^\d{1,2}:\d{2}/.test(hhmm)) {
    const [h, m] = hhmm.split(":");
    d.setHours(+h, +m, 0, 0);
  } else {
    d.setSeconds(0, 0);
  }
  if (backDays) d.setDate(d.getDate() - backDays);
  else if (d.getTime() - Date.now() > 5 * 60000) d.setDate(d.getDate() - 1);
  if (d.getTime() > Date.now()) d.setTime(Date.now());
  return d.getTime();
}

const BTN =
  "flex flex-col items-center gap-1 rounded-xl border border-line bg-surface-2 px-3 py-4 text-[0.96rem] font-semibold text-ink transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45";

export function ReportCard({ ready, busy, onReport }) {
  const [time, setTime] = useState(nowHHMM);
  const [day, setDay] = useState("0");

  async function fire(type) {
    const res = await onReport(type, resolveTs(time, parseInt(day, 10) || 0));
    if (res?.ok) {
      setTime(nowHHMM());
      setDay("0");
    }
  }

  return (
    <Card>
      <CardTitle>Reportar</CardTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={!ready || busy}
          onClick={() => fire("off")}
          className={`${BTN} hover:border-off hover:bg-off-soft`}
        >
          <span className="text-[1.3rem]">🔌</span>Se fue la luz
        </button>
        <button
          type="button"
          disabled={!ready || busy}
          onClick={() => fire("on")}
          className={`${BTN} hover:border-on hover:bg-on-soft`}
        >
          <span className="text-[1.3rem]">💡</span>Volvió la luz
        </button>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <span className="shrink-0 font-mono text-[0.8rem] text-ink-dim">
          ¿A qué hora?
        </span>
        <input
          type="time"
          aria-label="Hora del evento"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="min-w-[128px] rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[0.95rem] font-medium leading-tight text-ink outline-none focus-visible:outline-2 focus-visible:outline-amber"
        />
        <div className="relative max-w-[150px] flex-1">
          <select
            aria-label="Día del evento"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full appearance-none rounded-xl border border-line bg-surface-2 py-2.5 pl-3 pr-9 text-[0.92rem] font-medium text-ink outline-none focus-visible:outline-2 focus-visible:outline-amber"
          >
            <option value="0">Hoy</option>
            <option value="1">Ayer</option>
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-3.5 top-1/2 h-[7px] w-[7px] -translate-y-[70%] rotate-45 border-b-2 border-r-2 border-ink-dim"
          />
        </div>
      </div>

      <p className="mt-3 px-0.5 text-[0.84rem] text-ink-dim">
        {ready
          ? "La hora viene puesta en la actual. Ajústala si el corte fue antes."
          : "Selecciona tu urbanización para habilitar el reporte."}
      </p>
    </Card>
  );
}
