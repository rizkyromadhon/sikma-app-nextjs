import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/lib/zod";
import prisma from "@/lib/prisma";
import { compareSync } from "bcrypt-ts";
import { jwt, session } from "@/lib/auth-callbacks";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
              prodiId: true,
            },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = compareSync(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt,
    session,
  },
} satisfies NextAuthConfig;
