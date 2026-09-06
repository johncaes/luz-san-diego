import { fmtDur, hhmm, relTime } from "../lib/format.js";

export function StatusHero({ analysis, zoneName, hasZone }) {
  const { last, confirmers } = analysis;
  const off = last?.type === "off";
  const on = last?.type === "on";

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border bg-surface p-4 shadow-card ${
        off ? "border-off/45" : on ? "border-on/40" : "border-line"
      }`}
    >
      {hasZone && (
        <div className="mb-2.5 font-mono text-[0.74rem] tracking-[0.02em] text-ink-dim">
          San Diego · {zoneName}
        </div>
      )}

      <div className="flex items-center gap-2.5 font-display text-[1.5rem] font-extrabold tracking-[-0.01em]">
        <span
          className={`h-[15px] w-[15px] shrink-0 rounded-full ${
            off
              ? "animate-pulse bg-off shadow-[0_0_18px_2px] shadow-off/60"
              : on
                ? "bg-on shadow-[0_0_18px_2px] shadow-on/55"
                : "bg-ink-dim"
          }`}
        />
        <span>
          {!hasZone ? "—" : !last ? "Sin datos" : off ? "SIN LUZ" : "CON LUZ"}
        </span>
      </div>

      {hasZone && last && (
        <>
          <div className="mt-2.5 font-display text-[2rem] font-bold tracking-[-0.02em]">
            {off ? fmtDur(Date.now() - last.ts) : relTime(last.ts)}
          </div>
          <div className="mt-0.5 text-[0.88rem] text-ink-mid">
            {off
              ? `desde ${hhmm(new Date(last.ts))} · ${confirmers} ${
                  confirmers === 1 ? "vecino lo confirma" : "vecinos lo confirman"
                }`
              : `volvió a las ${hhmm(new Date(last.ts))} · ${confirmers} ${
                  confirmers === 1 ? "confirmación" : "confirmaciones"
                }`}
          </div>
        </>
      )}

      {hasZone && !last && (
        <div className="mt-1 text-[0.88rem] text-ink-mid">
          Nadie ha reportado aquí. Sé el primero.
        </div>
      )}
      {!hasZone && (
        <div className="mt-1 text-[0.88rem] text-ink-mid">
          Elige tu urbanización arriba.
        </div>
      )}
    </section>
  );
}
