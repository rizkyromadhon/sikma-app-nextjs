"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/lib/hooks/use-toast";
import { Suspense } from "react";
import FlashMessageListener from "./utils/FlashMessageListener";
import { Toaster } from "@/components/ui/toaster";
import { Session } from "next-auth";
import PasswordDefaultAlert from "./shared/PasswordDefaultAlert";
import { useMemo } from "react";

export function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const sessionKey = useMemo(() => session?.user?.id || "no-session", [session?.user?.id]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session} key={sessionKey}>
        <PasswordDefaultAlert />
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
