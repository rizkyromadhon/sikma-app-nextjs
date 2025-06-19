// src/components/Provider.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/lib/hooks/use-toast";
import { Suspense } from "react";
import FlashMessageListener from "./utils/FlashMessageListener";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <ToastProvider>
          {children}
          <Toaster />
          <Suspense>
            <FlashMessageListener />
          </Suspense>
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
