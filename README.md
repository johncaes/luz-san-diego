# ¿Cuándo se va la luz? — San Diego, Carabobo

App web pública de reportes vecinales de cortes eléctricos, con predicción
de la próxima falla por urbanización. Frontend estático (un solo
`index.html`) + Supabase como base de datos.

```
index.html            → la app (editar la config de Supabase adentro)
supabase/schema.sql   → tablas, seguridad (RLS), realtime y catálogo inicial
artifact-src/          → versión anterior hecha con la BD integrada de Claude (referencia)
```

---

## 1. Crear el proyecto en Supabase

1. Entra a <https://supabase.com> → **New project**.
2. Elige región **East US (North Virginia)** (la más cercana a Venezuela con
   buena latencia) y una contraseña de base de datos.
3. Espera ~2 min a que termine de aprovisionar.

## 2. Cargar el esquema

1. En el panel del proyecto: **SQL Editor** → **New query**.
2. Pega **todo** el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. **Run**. Debe terminar sin errores y crear las tablas `zonas` y
   `reportes`, las políticas de seguridad y las 68 urbanizaciones.

Puedes volver a correr ese archivo cuando quieras: es idempotente.

## 3. Conectar la app

1. En Supabase: **Project Settings › API**.
2. Copia **Project URL** y la **Publishable key** (`sb_publishable_...`).
3. Abre `index.html` y reemplaza al inicio del `<script>`:

   ```js
   var SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   var SUPABASE_ANON_KEY = "sb_publishable_...";
   ```

La publishable key es **pública a propósito** — va en el navegador de
todos. Lo que protege los datos son las políticas RLS del `schema.sql`:
cualquiera puede leer y crear reportes, nadie puede editar ni borrar.
Nunca pongas aquí la *secret key* (`sb_secret_...`).

## 4. Probar en local

Abrir `index.html` directo en el navegador funciona. Si tu navegador
bloquea algo por CORS, sirve la carpeta:

```bash
python3 -m http.server 8080
# luego abre http://localhost:8080
```

Elige una urbanización, reporta "Se fue la luz" y verifica que aparece en
**Actividad reciente** y en el **Table Editor** de Supabase.

## 5. Publicar

Es un sitio estático, cualquiera de estas sirve (todas con plan gratis):

| Servicio | Cómo |
|---|---|
| **Netlify** | app.netlify.com → **Add new site › Deploy manually** → arrastra la carpeta |
| **Cloudflare Pages** | Conecta el repo o sube la carpeta; sin configuración de build |
| **Vercel** | `vercel` en la carpeta, o importa el repo (framework: *Other*) |
| **GitHub Pages** | Sube el repo, Settings › Pages › rama `main` |

No hay paso de build. El único archivo que importa es `index.html`.

---

## Notas

**Volumen / costo.** Un municipio genera del orden de miles de reportes al
mes. El plan gratuito de Supabase (500 MB de BD, 2 GB de egreso, realtime
incluido) sobra por años.

**Abuso.** Hoy la protección es mínima: un `reporter` aleatorio guardado en
el navegador + un trigger que rechaza el mismo reporte repetido en < 2 min.
Alguien decidido puede meter reportes falsos. Si el proyecto crece, lo
siguiente sería:
- Turnstile / hCaptcha antes de reportar (invisible, gratis).
- Una Edge Function que valide y limite por IP.
- Peso por consenso: exigir 2–3 reportes independientes para cambiar el
  estado de una zona.

**Agregar urbanizaciones.** Los vecinos pueden desde la app ("Agregar
urbanización"). Para cargar varias de golpe, un `INSERT` en el SQL Editor
igual que en `schema.sql`.

**Predicción.** Se calcula en el navegador con los últimos ~600 eventos de
la zona: histograma por hora, día de la semana más afectado y duración
mediana del corte. Necesita al menos 4 cortes registrados para activarse.
