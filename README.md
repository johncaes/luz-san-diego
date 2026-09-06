# ¿Cuándo se va la luz? — San Diego, Carabobo

App web de reportes vecinales de cortes eléctricos, con predicción de la
próxima falla por urbanización.

- **Frontend:** Vite + React 19 + Tailwind CSS v4 (mobile-first)
- **Backend:** Supabase (Postgres + RLS + Realtime)

```
index.html              → entrada de Vite
src/
  App.jsx               → composición de la pantalla
  lib/
    supabase.js          → cliente + config (URL y publishable key)
    predict.js           → análisis y predicción (funciones puras)
    format.js            → helpers de fecha/duración/slug
  hooks/
    useZones.js          → catálogo de urbanizaciones + realtime
    useReports.js        → eventos de una zona + realtime + insertar
  components/            → Header, ZonePicker, StatusHero, ReportCard,
                           PredictionCard, HourChart, ActivityFeed, …
supabase/schema.sql     → tablas, RLS, triggers, realtime, catálogo de 68 urbanizaciones
legacy-static/          → versión anterior en un solo HTML sin build (referencia)
artifact-src/           → primera versión, hecha con la BD integrada de Claude
```

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/
npm run preview    # sirve dist/ para revisar el build
```

## Configurar Supabase

1. Crea un proyecto en <https://supabase.com> (región **East US**).
2. **SQL Editor** → pega [`supabase/schema.sql`](supabase/schema.sql) → **Run**
   (es idempotente, se puede correr varias veces).
3. **Project Settings › API** → copia **Project URL** y la **Publishable key**
   (`sb_publishable_...`).
4. Ponlas como variables de entorno (recomendado) o edítalas en
   `src/lib/supabase.js`:

   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
   ```

   Un archivo `.env` en la raíz sirve para local (está en `.gitignore`).
   La publishable key es **pública a propósito**; lo que protege los datos
   son las políticas RLS. Nunca uses aquí la *secret key* (`sb_secret_...`).

## Publicar

### GitHub Pages (automático)
Ya hay un workflow en `.github/workflows/deploy.yml`. Solo actívalo:

**Settings › Pages › Build and deployment › Source: GitHub Actions.**

Cada `git push` a `main` compila y publica. Queda en
`https://<usuario>.github.io/luz-san-diego/`.
Si usas env vars, agrégalas en **Settings › Secrets and variables › Actions**
y referéncialas en el workflow; si dejaste los valores en `supabase.js`, no
hace falta nada más.

### Vercel / Netlify
Importa el repo. Framework: **Vite**. Build: `npm run build`. Output: `dist`.
Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en las env vars del
proyecto. Cada push redeploya.

## Notas

**Predicción.** Se calcula en el navegador con los últimos ~600 eventos de la
zona: histograma por hora, día de la semana más afectado y duración mediana
del corte. Necesita ≥ 4 cortes registrados para activarse.

**Abuso.** Protección mínima hoy: un `reporter` aleatorio por dispositivo +
un trigger que rechaza el mismo reporte repetido en < 2 min. Si el proyecto
crece: Turnstile/hCaptcha antes de reportar, o una Edge Function que limite
por IP, o exigir varios reportes independientes para cambiar el estado.

**Agregar urbanizaciones.** Se hace a mano en el **SQL Editor** de Supabase:

```sql
insert into public.zonas (slug, nombre) values
  ('nombre-en-slug', 'Nombre bonito')
on conflict (slug) do nothing;
```

Aparece sola en la app (realtime). La app no tiene botón para agregar.
