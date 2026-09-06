export const WD = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** minúsculas + sin acentos, para búsquedas tolerantes. */
export function norm(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function slug(s) {
  return (
    String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 30) || "x"
  );
}

export function relTime(ms) {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 45) return "hace un momento";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return `hace ${h} h${rm ? ` ${rm} min` : ""}`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

export function fmtDur(ms) {
  const m = Math.round(ms / 60000);
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h === 0) return `${rm} min`;
  if (h < 24) return `${h} h${rm ? ` ${rm} min` : ""}`;
  const d = Math.floor(h / 24);
  return `${d} d ${h % 24} h`;
}

export function hhmm(d) {
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}
