import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "../layout";
import GoogleButton from "@/components/auth/GoogleButton";
import Link from "next/link";
import RegisterForm from "@/components/layouts/RegisterForm";
import { Card } from "@/components/ui/card";

const RegisterPage = () => {
  return (
    <AuthLayout>
      <Card className="px-6 py-12 w-full">
        <AuthHeader
          header="Halo, Pengguna Baru?"
          desc="Yuk, daftar dulu biar kamu bisa akses semua layanan presensi di sini."
        />
        <RegisterForm />

        {/* <GoogleButton /> */}
        <p className="text-center text-sm text-gray-500 dark:text-neutral-400">
          Sudah memiliki akun?{" "}
          <Link href={"/login"} className="underline hover:text-neutral-900 dark:hover:text-white">
            Masuk sekarang.
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;
