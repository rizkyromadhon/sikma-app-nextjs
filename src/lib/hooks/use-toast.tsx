// src/lib/hooks/use-toast.tsx

"use client";

import * as React from "react";
import type { ToastComponentProps } from "@/components/ui/toast";

type ToasterToast = ToastComponentProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

// --- State Management Logic (Refactored dengan useReducer) ---
type Action = { type: "ADD_TOAST"; toast: ToasterToast } | { type: "REMOVE_TOAST"; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

// --- React Hook and Provider ---

interface ToastContextType {
  toasts: ToasterToast[];
  // Kita hanya mengekspos fungsi 'toast' dan 'dismiss' yang lebih sederhana
  toast: (props: Omit<ToasterToast, "id">) => void;
  dismiss: (toastId: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = props.duration || TOAST_REMOVE_DELAY;

    dispatch({
      type: "ADD_TOAST",
      toast: { ...props, id, duration },
    });

    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", toastId: id });
    }, duration);
  }, []);

  const dismiss = React.useCallback((toastId: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, []);

  const value = React.useMemo(
    () => ({ toasts: state.toasts, toast, dismiss }),
    [state.toasts, toast, dismiss]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
