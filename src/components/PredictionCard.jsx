import { Card, CardTitle } from "./primitives.jsx";

/** Convierte "texto <hl>resaltado</hl> texto" en nodos React. */
function renderBig(text) {
  return text.split(/<hl>|<\/hl>/).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-amber">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function PredictionCard({ prediction, hasZone }) {
  if (!hasZone) {
    return (
      <Card className="border-amber/35">
        <CardTitle>Predicción</CardTitle>
        <p className="mt-0.5 font-display text-[1.25rem] font-bold leading-tight">
          Selecciona tu urbanización.
        </p>
      </Card>
    );
  }

  const { big, note, level, label, enoughData } = prediction;

  return (
    <Card className="border-amber/35">
      <CardTitle>Predicción</CardTitle>
      <p className="mt-0.5 text-balance font-display text-[1.25rem] font-bold leading-tight tracking-[-0.01em]">
        {renderBig(big)}
      </p>
      {note && <p className="mt-2 text-[0.86rem] text-ink-mid">{note}</p>}

      {enoughData && (
        <div className="mt-3 inline-flex items-center gap-2 font-mono text-[0.78rem] uppercase tracking-[0.08em] text-ink-dim">
          confianza
          <span className="flex gap-[3px]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block h-1.5 w-4 rounded-sm ${
                  i < level ? "bg-amber" : "bg-line"
                }`}
              />
            ))}
          </span>
          <span>{label}</span>
        </div>
      )}
    </Card>
  );
}
