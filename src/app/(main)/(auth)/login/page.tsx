import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "../layout";
import GoogleButton from "@/components/auth/GoogleButton";
import Link from "next/link";
import LoginForm from "@/components/layouts/LoginForm";
import React, { Suspense } from "react";
import { Card } from "@/components/ui/card";

const LoginPage = () => {
  return (
    <AuthLayout>
      <Card className="px-6 py-12 w-full">
        <AuthHeader header="Halo, Selamat Datang" desc="Yuk masuk dulu pakai akun kamu untuk mulai." />
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
        {/* <GoogleButton /> */}
        <p className="text-center text-sm text-gray-500 dark:text-neutral-400">
          Belum punya akun?{" "}
          <Link href={"/register"} className="underline hover:text-gray-900 dark:hover:text-white">
            Daftar sekarang.
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
