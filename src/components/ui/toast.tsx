"use client";

import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { LuX, LuCircleAlert, LuTriangleAlert, LuCircleCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";

// Varian style untuk setiap tipe toast (sukses, error, warning)
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 space-x-0 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        success:
          "border-green-200 bg-white text-green-700 dark:border-emerald-800 dark:bg-neutral-950 md:dark:bg-neutral-900 dark:text-green-400",
        error:
          "border-red-200 bg-white text-red-700 dark:border-red-800 dark:bg-neutral-950 dark:text-red-400",
        warning:
          "border-yellow-200 bg-white text-yellow-700 dark:border-yellow-800 dark:bg-neutral-950 dark:text-yellow-400",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);
type ToastVariant = "success" | "error" | "warning";

// Varian untuk progress bar
const progressBarVariants: Record<ToastVariant, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
};

// Varian untuk ikon
const icons: Record<ToastVariant, React.ReactElement> = {
  success: <LuCircleCheck className="h-6 w-6" />,
  error: <LuCircleAlert className="h-6 w-6" />,
  warning: <LuTriangleAlert className="h-6 w-6" />,
};

export interface ToastComponentProps extends VariantProps<typeof toastVariants> {
  id?: string;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
  children?: React.ReactNode;
  type?: ToastVariant;
}

const Toast = React.forwardRef<HTMLDivElement, ToastComponentProps>(
  ({ className, variant, title, description, duration = 5000, onClose, ...props }, ref) => {
    const currentVariant = variant || "warning";
    return (
      <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
        <div className="flex-shrink-0 mt-0.5">{icons[variant || "warning"]}</div>
        <div className="flex-1">
          {title && <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-inherit/50 opacity-0 transition-opacity hover:text-inherit/75 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <LuX className="h-4 w-4" />
          <span className="sr-only">Tutup</span>
        </button>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-inherit/10 overflow-hidden rounded-b-xl">
          <div
            className={cn("h-full origin-left", progressBarVariants[currentVariant])}
            style={{ animation: `toast-progress ${duration}ms linear forwards` }}
          ></div>
        </div>
      </div>
    );
  }
);
Toast.displayName = "Toast";

export { Toast };
