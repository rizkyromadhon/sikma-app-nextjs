import { type JWT } from "next-auth/jwt";
import { type Session, type User } from "next-auth";

export const jwt = async ({ token, user }: { token: JWT; user?: User }) => {
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.prodiId = user.prodiId;
  }
  return token;
};

export const session = async ({ session, token }: { session: Session; token: JWT }) => {
  if (session.user && token.id) {
    session.user.id = token.id as string;
    session.user.role = token.role;
    session.user.prodiId = token.prodiId;
  }
  return session;
};
