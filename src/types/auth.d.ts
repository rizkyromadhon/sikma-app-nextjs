import { type DefaultSession, type DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

type UserRole = "ADMIN" | "DOSEN" | "MAHASISWA";
type NullableString = string | null | undefined;

interface UserProdi {
  id: string;
  name: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: NullableString;
      nim?: NullableString;
      nip?: NullableString;
      prodi?: UserProdi | null;
      image?: NullableString;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    name: string;
    nim?: NullableString;
    nip?: NullableString;
    foto?: NullableString;
    prodi?: UserProdi | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    // sub: string;
    role: UserRole;
    name?: NullableString;
    nim?: NullableString;
    nip?: NullableString;
    picture?: NullableString;
    prodi?: UserProdi | null;
  }
}
