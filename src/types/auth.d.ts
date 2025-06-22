import { Role } from "@prisma/client";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: Role;
    prodiId?: string | null;
  }

  interface Session {
    user: {
      role?: Role;
      prodiId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    prodiId?: string | null;
  }
}
