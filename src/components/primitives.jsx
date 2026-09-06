export function Card({ className = "", children }) {
  return (
    <section
      className={`rounded-2xl border border-line bg-surface p-4 shadow-card ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children }) {
  return (
    <h2 className="mb-3 font-display text-[0.78rem] font-bold uppercase tracking-[0.14em] text-ink-dim">
      {children}
    </h2>
  );
}

export function Banner({ children }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 px-4 py-3.5 text-[0.88rem] text-ink-mid [&_b]:text-ink [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
      {children}
    </div>
  );
}
