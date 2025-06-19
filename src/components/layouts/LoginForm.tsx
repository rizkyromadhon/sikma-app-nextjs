"use client";

import { useActionState, useState } from "react";
import { PasswordInput } from "../auth/PasswordInput";
import { SubmitButton } from "../auth/SubmitButton";
import { TextInput } from "../auth/TextInput";
import { SignInCredentials } from "@/lib/action";
import { useSearchParams } from "next/navigation";

const LoginForm = () => {
  const [showPassword] = useState(false);
  const [state, formAction] = useActionState(SignInCredentials, null);
  const params = useSearchParams();
  const email = params.get("email") || "";

  return (
    <form action={formAction} className="space-y-4">
      <TextInput
        id="email"
        name="email"
        label="Email"
        defaultValue={email}
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

      <SubmitButton
        type="submit"
        text="Login"
        className="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-80 py-2 rounded-md font-semibold text-sm mt-2"
      />
    </form>
  );
};

export default LoginForm;
