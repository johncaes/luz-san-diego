import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";

const byName = (a, b) => a.name.localeCompare(b.name, "es");

function mapRow(z) {
  return {
    id: z.id,
    name: z.nombre,
    lastType: z.last_tipo || null,
    lastTs: z.last_ts ? Date.parse(z.last_ts) : 0,
  };
}

/** Catálogo de urbanizaciones + estado actual de cada una (en vivo). */
export function useZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounce = useRef();

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("zonas")
      .select("id,nombre,last_tipo,last_ts")
      .order("nombre");
    if (error) {
      console.warn("zonas", error);
      setLoading(false);
      return;
    }
    setZones((data || []).map(mapRow).sort(byName));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    load();
    const ch = supabase
      .channel("zonas-all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zonas" },
        () => {
          clearTimeout(debounce.current);
          debounce.current = setTimeout(load, 300);
        },
      )
      .subscribe();
    return () => {
      clearTimeout(debounce.current);
      supabase.removeChannel(ch);
    };
  }, [load]);

  return { zones, loading, reload: load };
}
