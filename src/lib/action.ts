"use server";
import { RegisterSchema, LoginSchema } from "@/lib/zod";
import { hashSync } from "bcrypt-ts";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export const SignUpCredentials = async (prevState: unknown, formData: FormData) => {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      data: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
      },
    };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "Terjadi kesalahan saat membuat akun.",
    };
  }

  redirect("/login?register=success");
};

export const SignInCredentials = async (prevState: unknown, formData: FormData) => {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      data: {
        email: formData.get("email") as string,
      },
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return redirect(`/login?login=notfound&email=${encodeURIComponent(email)}`);
    }

    const isAdmin = await prisma.user.findUnique({
      where: {
        role: "ADMIN",
        email,
      },
    });

    if (isAdmin) {
      await signIn("credentials", { email, password, redirectTo: "/admin/dashboard/?login=success" });
    }

    await signIn("credentials", { email, password, redirectTo: "/?login=success" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return redirect(`/login?login=failed&email=${encodeURIComponent(email)}`);
        default:
          return {
            message: "Terjadi kesalahan saat login.",
          };
      }
    }
    console.error(error);
    throw error;
  }
};
