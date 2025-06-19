import NextAuth, { User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/lib/zod";
import { compareSync } from "bcrypt-ts";
// import type { User } from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;
        const userFromDb = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            nim: true,
            nip: true,
            foto: true,
            prodi: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        console.log("USER DARI DATABASE:", userFromDb);

        if (!userFromDb || !userFromDb.password) {
          return null;
        }

        const passwordMatch = compareSync(password, userFromDb.password);

        if (!passwordMatch) return null;

        const user: User = {
          id: userFromDb.id,
          email: userFromDb.email,
          name: userFromDb.name ?? "",
          role: userFromDb.role,
          nim: userFromDb.nim ?? null,
          nip: userFromDb.nip ?? null,
          foto: userFromDb.foto ?? null,
          prodi: userFromDb.prodi ?? null,
        };

        return user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name ?? undefined;
        token.nim = user.nim ?? undefined;
        token.nip = user.nip ?? undefined;
        token.picture = user.foto ?? undefined;
        token.prodi = user.prodi ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name ?? "";
        session.user.nim = token.nim ?? undefined;
        session.user.nip = token.nip ?? undefined;
        session.user.image = token.picture ?? undefined;
        session.user.prodi = token.prodi ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
