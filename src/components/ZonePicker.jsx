import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardTitle } from "./primitives.jsx";
import { norm } from "../lib/format.js";

export function ZonePicker({ zones, value, onChange, onAddClick, loading }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = zones.find((z) => z.id === value) || null;

  const filtered = useMemo(() => {
    const n = norm(query.trim());
    if (!n) return zones;
    return zones.filter((z) => norm(z.name).includes(n));
  }, [zones, query]);

  useEffect(() => setActive(0), [query, open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-i="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function openList() {
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function close() {
    setOpen(false);
    setQuery("");
  }
  function pick(z) {
    if (!z) return;
    onChange(z.id);
    close();
  }
  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  return (
    <Card>
      <CardTitle>Tu urbanización</CardTitle>

      <div ref={rootRef} className="relative">
        <div className="relative">
          {open ? (
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls="zone-listbox"
              autoComplete="off"
              placeholder="Buscar urbanización…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full rounded-xl border border-amber bg-surface-2 py-3.5 pl-3.5 pr-10 text-base font-medium leading-tight text-ink outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={openList}
              aria-haspopup="listbox"
              className="flex w-full items-center gap-2 rounded-xl border border-line bg-surface-2 py-3.5 pl-3.5 pr-10 text-left text-base font-medium leading-tight outline-none focus-visible:outline-2 focus-visible:outline-amber"
            >
              {selected?.lastType === "off" && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-off" />
              )}
              <span className={selected ? "text-ink" : "text-ink-dim"}>
                {loading
                  ? "Cargando…"
                  : selected
                    ? selected.name
                    : "Selecciona tu urbanización"}
              </span>
            </button>
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-[70%] rotate-45 border-b-2 border-r-2 border-ink-dim"
          />
        </div>

        {open && (
          <ul
            ref={listRef}
            id="zone-listbox"
            role="listbox"
            className="absolute z-20 mt-1.5 max-h-[45vh] w-full overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface py-1 shadow-card"
          >
            {filtered.length === 0 && (
              <li className="px-3.5 py-2.5 text-[0.9rem] text-ink-dim">
                Sin resultados para “{query.trim()}”.
              </li>
            )}
            {filtered.map((z, i) => (
              <li
                key={z.id}
                data-i={i}
                role="option"
                aria-selected={z.id === value}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(z);
                }}
                className={`flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-[0.95rem] ${
                  i === active ? "bg-surface-2" : ""
                } ${z.id === value ? "text-amber" : "text-ink"}`}
              >
                {z.lastType === "off" && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-off" />
                )}
                <span className="truncate">{z.name}</span>
              </li>
            ))}
          </ul>
        )}
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
