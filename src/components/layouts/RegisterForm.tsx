"use client";

import { useState } from "react";
import { useActionState } from "react";
import { PasswordInput } from "../auth/PasswordInput";
import { SubmitButton } from "../auth/SubmitButton";
import { TextInput } from "../auth/TextInput";
import { SignUpCredentials } from "@/lib/action";

const RegisterForm = () => {
  const [showPassword] = useState(false);
  const [showPasswordConfirm] = useState(false);
  const [state, formAction] = useActionState(SignUpCredentials, null);

  return (
    <form action={formAction} className="space-y-4">
      <TextInput
        id="name"
        name="name"
        label="Nama Lengkap"
        defaultValue={state?.data?.name}
        placeholder="Budi Septianto"
        error={state?.error?.name}
      />
      <TextInput
        id="email"
        name="email"
        label="Email"
        defaultValue={state?.data?.email}
        placeholder="contoh@gmail.com"
        error={state?.error?.email}
      />
      <PasswordInput
        id="password"
        name="password"
        label="Password"
        placeholder="••••••••"
        type={showPassword ? "text" : "password"}
        error={Array.isArray(state?.error?.password) ? state?.error?.password[0] : state?.error?.password}
      />
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Konfirmasi Password"
        placeholder="••••••••"
        type={showPasswordConfirm ? "text" : "password"}
        error={
          Array.isArray(state?.error?.confirmPassword)
            ? state?.error?.confirmPassword[0]
            : state?.error?.confirmPassword
        }
      />
      <SubmitButton
        type="submit"
        text="Daftar Sekarang"
        className="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-80 py-2 rounded-md font-semibold text-sm mt-2"
      />
    </form>
  );
};

export default RegisterForm;
