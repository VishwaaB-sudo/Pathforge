import { useEffect, useRef } from 'react';
import { useUi } from '@/context/UiContext';

/**
 * Confirmation dialog for destructive actions (admin delete, demo reset).
 * Preserves the previous confirm-before-acting behaviour, with proper dialog
 * semantics, Escape-to-cancel and a focus trap.
 */
export default function Dialog() {
  const { confirmState, closeConfirm } = useUi();
  const panel = useRef(null);

  useEffect(() => {
    if (!confirmState) return;
    const first = panel.current?.querySelector('button');
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeConfirm(false);
        return;
      }
      if (e.key !== 'Tab') return;
      // keep focus inside the dialog
      const items = panel.current?.querySelectorAll('button');
      if (!items?.length) return;
      const list = [...items];
      const i = list.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : (i === -1 ? 0 : (i + 1) % list.length);
      list[next].focus();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmState, closeConfirm]);

  if (!confirmState) return null;

  const { title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger } = confirmState;

  return (
    <div className="overlay" onMouseDown={() => closeConfirm(false)}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        aria-describedby={body ? 'dlg-body' : undefined}
        ref={panel}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="dlg-title">{title}</h3>
        {body ? (
          <p className="mu" id="dlg-body">
            {body}
          </p>
        ) : null}
        <div className="dialog-actions">
          <button className="btn" onClick={() => closeConfirm(false)}>
            {cancelLabel}
          </button>
          <button
            className={danger ? 'btn danger' : 'btn p'}
            onClick={() => closeConfirm(true)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
