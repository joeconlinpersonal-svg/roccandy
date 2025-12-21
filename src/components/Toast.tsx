"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Toast = { id: string; message: string; tone: "success" | "error" };

type ToastContextValue = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      addToast: (toast) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { ...toast, id }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
      },
      removeToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    }),
    [toasts]
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<Toast>;
      if (custom.detail?.message && custom.detail?.tone) {
        value.addToast({ message: custom.detail.message, tone: custom.detail.tone });
      }
    };
    window.addEventListener("toast", handler as EventListener);
    return () => window.removeEventListener("toast", handler as EventListener);
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
        <div className="flex max-w-md flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-lg px-4 py-2 text-sm font-semibold shadow-lg ${
                toast.tone === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
