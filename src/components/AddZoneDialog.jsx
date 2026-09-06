import { useEffect, useRef, useState } from "react";

export function AddZoneDialog({ open, onClose, onSubmit }) {
  const ref = useRef(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      setName("");
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  function submit(e) {
    e.preventDefault();
    const v = name.trim();
    if (v) onSubmit(v);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="w-[calc(100%-40px)] max-w-[360px] rounded-2xl border border-line bg-surface p-[18px] text-ink shadow-card backdrop:bg-black/60"
    >
      <form onSubmit={submit}>
        <h3 className="mb-1 font-display text-lg font-bold">Agregar urbanización</h3>
        <p className="mb-3 text-[0.86rem] text-ink-mid">
          Nombre de la urbanización, conjunto residencial o calle de San Diego.
        </p>
        <input
          autoFocus
          maxLength={48}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Urbanización Paso Real"
          className="mb-3 w-full rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none focus-visible:outline-2 focus-visible:outline-amber"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[9px] border border-line bg-surface-2 px-3.5 py-2 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-[9px] border border-amber bg-amber px-3.5 py-2 font-semibold text-[#1c1608]"
          >
            Agregar
          </button>
        </div>
      </form>
    </dialog>
  );
}
