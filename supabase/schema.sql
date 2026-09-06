-- ¿Cuándo se va la luz? — esquema Supabase (San Diego, Carabobo)
-- Ejecuta todo este archivo en el SQL Editor de tu proyecto Supabase.
-- Es idempotente: puedes correrlo varias veces sin romper nada.

-- ─────────────────────────────────────────────────────────────
-- 1. Tablas
-- ─────────────────────────────────────────────────────────────
create table if not exists public.zonas (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  nombre     text not null check (char_length(nombre) between 2 and 60),
  custom     boolean not null default false,
  last_tipo  text check (last_tipo in ('off','on')),
  last_ts    timestamptz,
  creado_en  timestamptz not null default now()
);

create table if not exists public.reportes (
  id          uuid primary key default gen_random_uuid(),
  zona_id     uuid not null references public.zonas(id) on delete cascade,
  tipo        text not null check (tipo in ('off','on')),
  ocurrio_en  timestamptz not null,
  reporter    text,
  creado_en   timestamptz not null default now()
);

create index if not exists reportes_zona_fecha_idx
  on public.reportes (zona_id, ocurrio_en desc);
create index if not exists reportes_guard_idx
  on public.reportes (zona_id, tipo, reporter, creado_en desc);

-- ─────────────────────────────────────────────────────────────
-- 2. Trigger: mantener el estado actual de cada zona (para el punto ● del selector)
-- ─────────────────────────────────────────────────────────────
create or replace function public.bump_zona()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.zonas
     set last_tipo = new.tipo,
         last_ts   = new.ocurrio_en
   where id = new.zona_id
     and (last_ts is null or new.ocurrio_en >= last_ts);
  return new;
end;
$$;

drop trigger if exists trg_bump_zona on public.reportes;
create trigger trg_bump_zona
  after insert on public.reportes
  for each row execute function public.bump_zona();

-- ─────────────────────────────────────────────────────────────
-- 3. Trigger: anti-duplicado suave (mismo reporter + zona + tipo en < 2 min)
--    No es seguridad real (el reporter viene del navegador), solo evita
--    dobles clics y reportes repetidos accidentales.
-- ─────────────────────────────────────────────────────────────
create or replace function public.guard_reporte()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.reporter is not null and exists (
    select 1 from public.reportes
     where zona_id  = new.zona_id
       and tipo     = new.tipo
       and reporter = new.reporter
       and creado_en > now() - interval '2 minutes'
  ) then
    raise exception 'Ya registraste ese reporte hace un momento.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_reporte on public.reportes;
create trigger trg_guard_reporte
  before insert on public.reportes
  for each row execute function public.guard_reporte();

-- ─────────────────────────────────────────────────────────────
-- 4. Row Level Security
--    La clave anónima es pública; estas políticas son lo que protege los datos.
-- ─────────────────────────────────────────────────────────────
alter table public.zonas    enable row level security;
alter table public.reportes enable row level security;

drop policy if exists "zonas_select"  on public.zonas;
drop policy if exists "zonas_insert"  on public.zonas;
drop policy if exists "reportes_select" on public.reportes;
drop policy if exists "reportes_insert" on public.reportes;

-- Cualquiera puede leer el catálogo de zonas
create policy "zonas_select" on public.zonas
  for select to anon, authenticated using (true);

-- Cualquiera puede agregar una zona nueva, pero solo marcada como custom
create policy "zonas_insert" on public.zonas
  for insert to anon, authenticated
  with check (custom = true and char_length(nombre) between 2 and 60);

-- Cualquiera puede leer los reportes
create policy "reportes_select" on public.reportes
  for select to anon, authenticated using (true);

-- Cualquiera puede crear un reporte, con la fecha dentro de una ventana razonable
create policy "reportes_insert" on public.reportes
  for insert to anon, authenticated
  with check (
    tipo in ('off','on')
    and ocurrio_en > now() - interval '7 days'
    and ocurrio_en < now() + interval '10 minutes'
  );

-- Sin políticas de update/delete => anon no puede modificar ni borrar nada.

-- ─────────────────────────────────────────────────────────────
-- 5. Realtime
-- ─────────────────────────────────────────────────────────────
do $$
begin
  begin
    alter publication supabase_realtime add table public.reportes;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime add table public.zonas;
  exception when others then null;
  end;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 6. Catálogo inicial de urbanizaciones de San Diego
-- ─────────────────────────────────────────────────────────────
insert into public.zonas (slug, nombre) values
  ('valle-arriba',              'Valle Arriba'),
  ('primero-de-mayo',           '1.º de Mayo'),
  ('agua-de-canto',             'Agua de Canto'),
  ('altos-del-paraiso',         'Altos del Paraíso'),
  ('bosqueserino',              'Bosqueserino'),
  ('campo-solo',                'Campo Solo'),
  ('fundacion-los-cedros',      'Fundación los Cedros'),
  ('chalets-country',           'Chalets Country'),
  ('colinas-de-san-diego-ii',   'Conj. Res. Colinas de San Diego II'),
  ('poblado-de-san-diego',      'Conj. Res. Poblado de San Diego'),
  ('conj-res-emmanuel',         'Conj. Res. Emmanuel'),
  ('valles-del-nogal',          'Conj. Res. Valles del Nogal'),
  ('country-park-villaserino',  'Country Park Villaserino'),
  ('divino-nino',               'Divino Niño'),
  ('el-morro-i-y-ii',           'El Morro I y II'),
  ('el-paraiso',                'El Paraíso'),
  ('el-polvero',                'El Polvero'),
  ('el-remanso',                'El Remanso'),
  ('el-tulipan',                'El Tulipán'),
  ('isla-de-aves',              'Isla de Aves'),
  ('la-caracara',               'La Caracara'),
  ('la-esmeralda',              'La Esmeralda'),
  ('la-querencia',              'La Querencia'),
  ('laguna-club',               'Laguna Club'),
  ('las-gaviotas',              'Las Gaviotas'),
  ('las-josefinas',             'Las Josefinas'),
  ('las-majaguas',              'Las Majaguas'),
  ('las-mercedes',              'Las Mercedes'),
  ('las-morochas',              'Las Morochas'),
  ('lomas-de-la-esmeralda',     'Lomas de La Esmeralda'),
  ('lomas-de-la-hacienda',      'Lomas de la Hacienda'),
  ('los-arales',                'Los Arales'),
  ('los-jarales',               'Los Jarales'),
  ('los-magallanes',            'Los Magallanes'),
  ('macomaco',                  'Macomaco'),
  ('mini-granja',               'Mini Granja'),
  ('monte-mayor',               'Monte Mayor'),
  ('monteserino',               'Monteserino'),
  ('los-andes-i-y-ii',          'Parq. Res. Los Andes I y II'),
  ('parqueserino',              'Parqueserino'),
  ('paso-real',                 'Paso Real I, II, III y IV'),
  ('paula-berbecia',            'Paula Berbecia'),
  ('pueblo-la-cumaca',          'Pueblo La Cumaca'),
  ('residencias-el-parque',     'Residencias El Parque'),
  ('residencias-orion',         'Residencias Orión'),
  ('residencias-tulipan',       'Residencias Tulipán'),
  ('sabana-del-medio',          'Sabana del Medio'),
  ('san-antonio',               'San Antonio'),
  ('sansur',                    'Sansur'),
  ('santa-ana',                 'Santa Ana'),
  ('senderos-de-san-diego',     'Senderos de San Diego'),
  ('terra-nostra',              'Terra Nostra'),
  ('terrazas-de-san-diego',     'Terrazas de San Diego'),
  ('trigal-de-san-diego',       'Trigal de San Diego'),
  ('valle-fresco',              'Valle Fresco'),
  ('valle-verde',               'Valle Verde'),
  ('valle-de-oro',              'Valle de Oro'),
  ('valle-real',                'Valle Real'),
  ('valle-del-sol',             'Valle del Sol'),
  ('valles-de-san-diego',       'Valles de San Diego'),
  ('valle-topacio',             'Valle Topacio'),
  ('villa-bahia',               'Villa Bahía'),
  ('villa-jardin',              'Villa Jardín'),
  ('villa-maporal',             'Villa Maporal'),
  ('villa-nueva',               'Villa Nueva'),
  ('villas-san-diego',          'Villas San Diego'),
  ('villas-de-alcala',          'Villas de Alcalá'),
  ('yuma',                      'Yuma')
on conflict (slug) do nothing;
