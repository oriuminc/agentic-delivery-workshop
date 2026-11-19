import { useEffect } from 'react';

export interface ToastMessage {
  kind: 'error' | 'success';
  text: string;
  requestId?: string;
}

/** Transient notice. Errors show the request id so users can report it (→ /rca <id>). */
export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, toast.kind === 'error' ? 8000 : 2500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <span>{toast.text}</span>
      {toast.requestId && <code className="toast-ref">Ref {toast.requestId}</code>}
      <button type="button" className="toast-close" aria-label="Dismiss" onClick={onDismiss}>×</button>
    </div>
  );
}
