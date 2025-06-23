import { Role } from "@prisma/client";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: Role;
    prodiId?: string | null;
    nim?: string | null;
    nip?: string | null;
  }

  interface Session {
    user: {
      role?: Role;
      prodiId?: string | null;
      nim?: string | null;
      nip?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    prodiId?: string | null;
    nim?: string | null;
    nip?: string | null;
  }
}
