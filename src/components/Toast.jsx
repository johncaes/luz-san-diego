export function Toast({ message }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4.5 py-2.5 text-[0.86rem] font-semibold text-bg transition-all duration-200 ${
        message ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
