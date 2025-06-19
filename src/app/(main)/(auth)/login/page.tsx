import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "../layout";
import GoogleButton from "@/components/auth/GoogleButton";
import Link from "next/link";
import LoginForm from "@/components/layouts/LoginForm";

const LoginPage = () => {
  return (
    <AuthLayout className="mt-20">
      <AuthHeader header="Halo, Selamat Datang" desc="Yuk masuk dulu pakai akun kamu untuk mulai." />
      <LoginForm />
      <GoogleButton />
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Belum punya akun?{" "}
        <Link href={"/register"} className="underline hover:text-gray-900 dark:hover:text-white">
          Daftar sekarang.
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
