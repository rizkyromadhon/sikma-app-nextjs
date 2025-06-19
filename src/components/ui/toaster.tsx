// src/components/ui/toaster.tsx

"use client";

import { useToast } from "@/lib/hooks/use-toast";
import { Toast } from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 md:left-2/3 md:translate-x-3/7  z-[100] flex flex-col gap-2 w-full max-w-[300px] md:max-w-[340px]">
      {toasts.map(function ({ id, title, description, type, duration, ...props }) {
        return (
          <Toast
            key={id}
            variant={type}
            title={title}
            description={description}
            duration={duration}
            onClose={() => dismiss(id)}
            {...props}
          />
        );
      })}
    </div>
  );
}
