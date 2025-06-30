import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.prodiId = user.prodiId;
        token.foto = user.foto;
        token.isDefaultPassword = user.isDefaultPassword ?? false;
        token.isProfileComplete = user.isProfileComplete ?? false;
      }

      if (trigger === "update" && session?.user) {
        token.isProfileComplete = session.user.isProfileComplete ?? false;
        token.isDefaultPassword = user.isDefaultPassword ?? false;
        token.no_hp = session.user.no_hp;
        token.alamat = session.user.alamat;
        token.foto = session.user.foto;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.prodiId = token.prodiId;
        session.user.isDefaultPassword = token.isDefaultPassword ?? false;
        session.user.isProfileComplete = token.isProfileComplete ?? false;
        session.user.no_hp = token.no_hp;
        session.user.alamat = token.alamat;
        session.user.foto = token.foto;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
