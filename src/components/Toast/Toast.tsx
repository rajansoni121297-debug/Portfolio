"use client";
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

interface ToastContextType {
  toast: (msg: string) => void;
}
const ToastContext = createContext<ToastContextType>({ toast: () => {} });
export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string; show: boolean }[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((msg: string) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, msg, show: false }]);
    // Double RAF for CSS transition trigger
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, show: true } : t));
      });
    });
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, show: false } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 400);
    }, 2600);
  }, []);

  useEffect(() => {
    (window as any).toast = toast;
    return () => { delete (window as any).toast; };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div id="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast${t.show ? " show" : ""}`}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
