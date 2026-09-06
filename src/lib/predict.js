import { WD, fmtDur, hhmm } from "./format.js";

/** Colapsa marcas de tiempo muy cercanas en un solo evento. */
function dedupe(times, gapMs) {
  const sorted = [...times].sort((a, b) => a - b);
  const out = [];
  for (const t of sorted) {
    if (!out.length || t - out[out.length - 1] > gapMs) out.push(t);
  }
  return out;
}

/**
 * Analiza la lista de eventos de una urbanización.
 * events: [{ type: "off" | "on", ts: number }]
 */
export function analyze(events) {
  const starts = [];
  const restores = [];
  for (const e of events) {
    if (e.type === "off") starts.push(e.ts);
    else if (e.type === "on") restores.push(e.ts);
  }
  const outages = dedupe(starts, 40 * 60 * 1000);
  const ons = dedupe(restores, 40 * 60 * 1000);

  const byHour = new Array(24).fill(0);
  const byWd = new Array(7).fill(0);
  for (const t of outages) {
    const d = new Date(t);
    byHour[d.getHours()]++;
    byWd[d.getDay()]++;
  }

  const durs = [];
  for (const t of outages) {
    for (const on of ons) {
      if (on > t && on - t < 20 * 3600 * 1000) {
        durs.push(on - t);
        break;
      }
    }
  }
  durs.sort((a, b) => a - b);
  const median = durs.length ? durs[Math.floor(durs.length / 2)] : null;

  let last = null;
  for (const e of events) if (!last || e.ts > last.ts) last = e;

  let confirmers = 0;
  if (last) {
    confirmers = events.filter(
      (e) => e.type === last.type && Math.abs(e.ts - last.ts) < 90 * 60 * 1000,
    ).length;
  }

  return { outages, byHour, byWd, median, last, confirmers, count: outages.length };
}

function topWd(byWd) {
  const m = Math.max(...byWd);
  if (m === 0) return "—";
  return byWd
    .map((c, i) => ({ c, i }))
    .filter((x) => x.c >= m * 0.7)
    .map((x) => WD[x.i])
    .join("/");
}

function confidence(samples, maxHour) {
  const conc = maxHour / Math.max(1, samples);
  let s = (samples >= 20 ? 2 : samples >= 8 ? 1 : 0) + (conc > 0.34 ? 1 : 0);
  s = Math.max(0, Math.min(3, s));
  return { level: s, label: ["baja", "baja", "media", "alta"][s] };
}

/**
 * Devuelve el texto y metadatos de la predicción.
 * `big` puede traer <span class="hl"> — se renderiza con highlight.
 */
export function predict(a) {
  const maxH = Math.max(...a.byHour);
  const now = new Date();
  const res = { big: "", note: "", level: 0, label: "", hotHours: [], enoughData: a.count >= 4 };

  res.hotHours = a.byHour
    .map((c, h) => ({ c, h }))
    .filter((x) => x.c > 0)
    .sort((x, y) => y.c - x.c)
    .slice(0, 3)
    .map((x) => x.h);

  if (a.count < 4) {
    res.big = "Sigue reportando para activar la predicción.";
    res.note = `Registrados ${a.count} de 4 cortes mínimos en esta urbanización.`;
    return res;
  }

  const offNow = a.last && a.last.type === "off";

  if (offNow && !a.median) {
    res.big = 'Corte en curso. <hl>Aún no hay datos</hl> de cuánto suele durar aquí.';
    res.note = "Cuando alguien reporte que volvió la luz se calculará la duración típica.";
    Object.assign(res, confidence(a.count, maxH));
    return res;
  }

  if (offNow && a.median) {
    const eta = new Date(a.last.ts + a.median);
    if (eta.getTime() < Date.now()) {
      res.big = `La luz ya <hl>superó la duración típica</hl> (${fmtDur(a.median)}). Podría volver pronto.`;
    } else {
      const sameDay = eta.toDateString() === now.toDateString();
      res.big = `Luz estimada de vuelta: <hl>${sameDay ? "hoy " : WD[eta.getDay()] + " "}${hhmm(eta)}</hl>`;
      res.note = `Duración típica de corte aquí: ${fmtDur(a.median)}.`;
    }
    Object.assign(res, confidence(a.count, maxH));
    return res;
  }

  const thr = Math.max(2, maxH * 0.5);
  let found = null;
  for (let d = 1; d <= 47; d++) {
    const t = new Date(now.getTime());
    t.setMinutes(0, 0, 0);
    t.setHours(now.getHours() + d);
    if (a.byHour[t.getHours()] >= thr) {
      found = t;
      break;
    }
  }
  if (found) {
    const tomorrow = new Date(now.getTime() + 864e5).toDateString();
    const day =
      found.toDateString() === now.toDateString()
        ? "hoy"
        : found.toDateString() === tomorrow
          ? "mañana"
          : WD[found.getDay()];
    const h = found.getHours();
    res.big = `Próximo corte probable: <hl>${day} entre ${h}:00 y ${h + 1}:00</hl>`;
  } else {
    res.big = "No hay una franja horaria dominante todavía.";
  }
  if (res.hotHours.length) {
    res.note =
      "Franjas más afectadas: " +
      res.hotHours.map((h) => `${h}:00`).join(", ") +
      " · días: " +
      topWd(a.byWd);
  }
  Object.assign(res, confidence(a.count, maxH));
  return res;
}
