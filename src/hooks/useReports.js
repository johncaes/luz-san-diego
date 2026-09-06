import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, deviceId } from "../lib/supabase.js";

/**
 * Eventos (cortes / restablecimientos) de una urbanización, en vivo.
 * events: [{ type: "off" | "on", ts: number }] ordenados desc por ts.
 */
export function useReports(zoneId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef();

  const load = useCallback(async () => {
    if (!supabase || !zoneId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("reportes")
      .select("tipo,ocurrio_en")
      .eq("zona_id", zoneId)
      .order("ocurrio_en", { ascending: false })
      .limit(600);
    setLoading(false);
    if (error) {
      console.warn("reportes", error);
      return;
    }
    setEvents(
      (data || [])
        .map((r) => ({ type: r.tipo, ts: Date.parse(r.ocurrio_en) }))
        .filter((e) => e.ts),
    );
  }, [zoneId]);

  useEffect(() => {
    setEvents([]);
    if (!supabase || !zoneId) return;
    load();
    const ch = supabase
      .channel("rep-" + zoneId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reportes",
          filter: "zona_id=eq." + zoneId,
        },
        () => {
          clearTimeout(debounce.current);
          debounce.current = setTimeout(load, 250);
        },
      )
      .subscribe();
    return () => {
      clearTimeout(debounce.current);
      supabase.removeChannel(ch);
    };
  }, [zoneId, load]);

  /** Inserta un reporte. Devuelve { ok } o { error: "dup" | "other" }. */
  const addReport = useCallback(
    async (type, whenMs) => {
      if (!supabase || !zoneId) return { error: "other" };
      const { error } = await supabase.from("reportes").insert({
        zona_id: zoneId,
        tipo: type,
        ocurrio_en: new Date(whenMs).toISOString(),
        reporter: deviceId(),
      });
      if (error) {
        console.warn("addReport", error);
        return { error: /momento|duplicad/i.test(error.message || "") ? "dup" : "other" };
      }
      load();
      return { ok: true };
    },
    [zoneId, load],
  );

  return { events, loading, addReport };
}
