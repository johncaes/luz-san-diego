import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { configured } from "./lib/supabase.js";
import { analyze, predict } from "./lib/predict.js";
import { useZones } from "./hooks/useZones.js";
import { useReports } from "./hooks/useReports.js";
import { Header } from "./components/Header.jsx";
import { Banner } from "./components/primitives.jsx";
import { ZonePicker } from "./components/ZonePicker.jsx";
import { StatusHero } from "./components/StatusHero.jsx";
import { ReportCard } from "./components/ReportCard.jsx";
import { PredictionCard } from "./components/PredictionCard.jsx";
import { HourChart } from "./components/HourChart.jsx";
import { ActivityFeed } from "./components/ActivityFeed.jsx";
import { AddZoneDialog } from "./components/AddZoneDialog.jsx";
import { Toast } from "./components/Toast.jsx";

const LS_ZONE = "sd_zone";

export default function App() {
  const { zones, loading, addZone } = useZones();
  const [zoneId, setZoneId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef();
  const [, tick] = useState(0);

  const { events, addReport } = useReports(zoneId);

  // refresca los tiempos relativos cada minuto
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // restaura la última urbanización elegida
  useEffect(() => {
    if (zoneId || !zones.length) return;
    let saved = null;
    try {
      saved = localStorage.getItem(LS_ZONE);
    } catch {
      /* ignore */
    }
    if (saved && zones.some((z) => z.id === saved)) setZoneId(saved);
  }, [zones, zoneId]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);

  const selectZone = useCallback((id) => {
    setZoneId(id);
    try {
      if (id) localStorage.setItem(LS_ZONE, id);
    } catch {
      /* ignore */
    }
  }, []);

  const analysis = useMemo(() => analyze(events), [events]);
  const prediction = useMemo(() => predict(analysis), [analysis]);
  const zoneName = zones.find((z) => z.id === zoneId)?.name || "";

  const handleReport = useCallback(
    async (type, whenMs) => {
      setBusy(true);
      const res = await addReport(type, whenMs);
      setBusy(false);
      if (res.ok) {
        showToast(type === "off" ? "Reportado: se fue la luz" : "Reportado: volvió la luz");
      } else if (res.error === "dup") {
        showToast("Ya registraste ese reporte hace poco");
      } else {
        showToast("No se pudo guardar, reintenta");
      }
      return res;
    },
    [addReport, showToast],
  );

  const handleAddZone = useCallback(
    async (name) => {
      setDialogOpen(false);
      const res = await addZone(name);
      if (!res) {
        showToast("No se pudo agregar");
        return;
      }
      selectZone(res.id);
      showToast(res.duplicate ? "Esa urbanización ya existe" : "Urbanización agregada");
    },
    [addZone, selectZone, showToast],
  );

  return (
    <div className="mx-auto flex max-w-[600px] flex-col gap-4 px-4 pb-16 pt-6">
      <Header />

      {!configured && (
        <Banner>
          <b>Falta conectar Supabase.</b> Define <code>VITE_SUPABASE_URL</code> y{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>, o edita{" "}
          <code>src/lib/supabase.js</code>. Pasos en <code>README.md</code>.
        </Banner>
      )}

      <ZonePicker
        zones={zones}
        value={zoneId}
        loading={loading}
        onChange={selectZone}
        onAddClick={() => setDialogOpen(true)}
      />

      <StatusHero analysis={analysis} zoneName={zoneName} hasZone={!!zoneId} />

      <ReportCard ready={configured && !!zoneId} busy={busy} onReport={handleReport} />

      <PredictionCard prediction={prediction} hasZone={!!zoneId} />

      <HourChart
        byHour={analysis.byHour}
        hotHours={prediction.hotHours}
        count={analysis.count}
        hasZone={!!zoneId}
      />

      <ActivityFeed events={events} hasZone={!!zoneId} />

      <p className="text-center font-mono text-[0.76rem] text-ink-dim">
        Datos aportados por vecinos · no es información oficial de CORPOELEC
      </p>

      <AddZoneDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddZone}
      />
      <Toast message={toast} />
    </div>
  );
}
