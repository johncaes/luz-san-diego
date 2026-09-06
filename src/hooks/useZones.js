import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { slug } from "../lib/format.js";

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

  const addZone = useCallback(
    async (name) => {
      name = String(name || "").trim();
      if (!name || !supabase) return null;
      const dup = zones.find((z) => z.name.toLowerCase() === name.toLowerCase());
      if (dup) return { id: dup.id, duplicate: true };
      const { data, error } = await supabase
        .from("zonas")
        .insert({
          nombre: name,
          slug: slug(name) + "-" + Math.random().toString(36).slice(2, 6),
          custom: true,
        })
        .select("id,nombre,last_tipo,last_ts")
        .single();
      if (error) {
        console.warn("addZone", error);
        return null;
      }
      setZones((prev) => [...prev, mapRow(data)].sort(byName));
      return { id: data.id };
    },
    [zones],
  );

  return { zones, loading, addZone, reload: load };
}
