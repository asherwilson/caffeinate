"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastTone = "error" | "info" | "success" | "warning";

type ToastInput = { code?: string; message: string; tone?: ToastTone };
type ToastRecord = ToastInput & { id: number };
type ToastContextValue = {
  dismissToast: (id: number) => void;
  pushToast: (toast: ToastInput) => void;
  toasts: ToastRecord[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);
  const dismissToast = useCallback(
    (id: number) =>
      setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  );
  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 3600);
    },
    [dismissToast],
  );
  const value = useMemo(
    () => ({ dismissToast, pushToast, toasts }),
    [dismissToast, pushToast, toasts],
  );
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function ToastViewport() {
  const { dismissToast, toasts } = useToast();
  return (
    <section
      className="toast-viewport"
      aria-label="System notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <article
          className="system-toast"
          data-tone={toast.tone ?? "info"}
          key={toast.id}
        >
          <div className="toast-heading">
            <span>{`// SYSTEM / ${(toast.tone ?? "info").toUpperCase()}`}</span>
            <span>{toast.code ?? "ACK"}</span>
          </div>
          <div className="toast-body">
            <p>{toast.message}</p>
            <button
              className="cursor-pointer"
              onClick={() => dismissToast(toast.id)}
              type="button"
            >
              DISMISS
            </button>
          </div>
          <div className="toast-life" aria-hidden="true">
            <span />
          </div>
        </article>
      ))}
    </section>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
