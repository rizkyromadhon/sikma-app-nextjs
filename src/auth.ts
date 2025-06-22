// File: src/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "@/auth.config";

export const {
  handlers,
  signIn,
  signOut,
  auth, // <-- Inilah satu-satunya `auth` yang akan kita gunakan
} = NextAuth({
  ...authConfig, // Gunakan provider dari file terpisah
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Saat login, pindahkan data dari 'user' ke 'token'
        token.id = user.id;
        token.role = user.role;
        token.prodiId = user.prodiId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // Ambil data dari 'token' dan masukkan ke 'session'
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.prodiId = token.prodiId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
