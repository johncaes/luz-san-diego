import { createClient } from "@supabase/supabase-js";

/*
 * Config de Supabase.
 * Se puede sobreescribir con variables de entorno VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY (por ejemplo en Vercel/Netlify). Si no hay,
 * usa estos valores por defecto.
 *
 * La "publishable key" (sb_publishable_...) es segura de exponer en el
 * navegador: lo que protege los datos son las políticas RLS de
 * supabase/schema.sql. NUNCA pongas aquí la secret key.
 */
const URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://jhiagtuguxjwyldpjlpn.supabase.co";

const ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_AWfCz59C3Fvx6yoRsJMZJQ_uU3hLECY";

export const configured =
  !!URL && !URL.includes("TU-PROYECTO") && !!ANON_KEY && !ANON_KEY.includes("TU_ANON");

export const supabase = configured ? createClient(URL, ANON_KEY) : null;

/** id anónimo estable por dispositivo (para el anti-duplicado del backend). */
export function deviceId() {
  const KEY = "sd_uid";
  try {
    let v = localStorage.getItem(KEY);
    if (!v) {
      v = "u" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(KEY, v);
    }
    return v;
  } catch {
    return "u" + Math.random().toString(36).slice(2);
  }
}
