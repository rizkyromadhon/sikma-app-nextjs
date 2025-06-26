"use client";

import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PasswordDefaultAlert() {
  const { data: session, status } = useSession();
  const [shouldDisplayAlert, setShouldDisplayAlert] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  useEffect(() => {
    if (status !== "loading" && !hasCheckedSession) {
      setHasCheckedSession(true);
    }

    if (status === "authenticated" && session?.user?.isDefaultPassword) {
      setShouldDisplayAlert(true);
    } else if (status !== "loading") {
      setShouldDisplayAlert(false);
    }
  }, [status, session, hasCheckedSession]);

  if (status === "loading" || !hasCheckedSession) {
    return null;
  }

  if (!shouldDisplayAlert) {
    return null;
  }

  return (
    <Alert
      variant="destructive"
      className="rounded-none border-0 px-4 py-2 flex items-center justify-center bg-red-700 dark:bg-red-800 text-white space-x-2 text-sm"
    >
      <span>Anda masih menggunakan password default. Demi keamanan, silahkan ubah password</span>
      <Link href="/ganti-password" className="underline font-semibold">
        disini.
      </Link>
    </Alert>
  );
}
