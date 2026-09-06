export function Header() {
  return (
    <header>
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
        San Diego · Carabobo
      </p>
      <h1 className="text-balance font-display text-[clamp(1.9rem,7vw,2.7rem)] font-extrabold leading-[1.02] tracking-[-0.02em]">
        <span className="text-amber">⚡</span> ¿Cuándo se va la luz?
      </h1>
      <p className="mt-2 text-[0.92rem] text-ink-mid">
        Bitácora vecinal de cortes eléctricos. Elige tu urbanización, reporta
        cuando se va y cuando vuelve, y la app aprende el patrón de cada zona.
      </p>
    </header>
  );
}
