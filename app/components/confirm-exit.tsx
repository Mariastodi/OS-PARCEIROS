"use client";
import { useEffect, useRef } from "react";
export default function ConfirmExit({
  onCancel,
  onExit,
}: {
  onCancel: () => void;
  onExit: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="exit-dialog"
      aria-labelledby="exit-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="exit-title">Sair desta partida?</h2>
      <p>O placar desta partida será descartado. O tempo continua correndo.</p>
      <div className="answer-actions">
        <button className="add-player" autoFocus onClick={onCancel}>
          Continuar jogando
        </button>
        <button className="primary" onClick={onExit}>
          Sair
        </button>
      </div>
    </dialog>
  );
}
