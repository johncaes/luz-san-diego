import { Card, CardTitle } from "./primitives.jsx";

export function ZonePicker({ zones, value, onChange, onAddClick, loading }) {
  return (
    <Card>
      <CardTitle>Tu urbanización</CardTitle>
      <div className="relative">
        <select
          aria-label="Selecciona tu urbanización"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full appearance-none rounded-xl border border-line bg-surface-2 py-3.5 pl-3.5 pr-10 text-base font-medium leading-tight text-ink outline-none focus-visible:outline-2 focus-visible:outline-amber"
        >
          <option value="">{loading ? "Cargando…" : "Selecciona…"}</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
              {z.lastType === "off" ? "  ●" : ""}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-[70%] rotate-45 border-b-2 border-r-2 border-ink-dim"
        />
      </div>
      <p className="mt-2.5 px-0.5 text-[0.84rem] text-ink-dim">
        ¿No aparece?{" "}
        <button
          type="button"
          onClick={onAddClick}
          className="font-semibold text-amber underline underline-offset-2"
        >
          Agregar urbanización
        </button>
      </p>
    </Card>
  );
}
