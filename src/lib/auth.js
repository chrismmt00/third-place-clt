import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db.js";
import { authenticate } from "./authentication.js";
import { UserError } from "./errors.js";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [Credentials({
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(credentials, request) {
      try { return await authenticate(credentials, request.headers); }
      catch { return null; }
    },
  })],
  callbacks: {
    jwt({ token, user }) {
      if (user) Object.assign(token, { id: user.id, role: user.role, sessionVersion: user.sessionVersion });
      return token;
    },
    session({ session, token }) {
      session.user = { id: token.id, role: token.role, sessionVersion: token.sessionVersion };
      return session;
    },
  },
  logger: {
    error() { console.error("Authentication request failed."); },
    warn() {}, debug() {},
  },
});

/** Re-read the account on every protected call, including role and session revocation. */
export async function requireAdmin({ allowPasswordChange = false } = {}) {
  const session = await auth();
  if (!session?.user?.id) throw new UserError("Please sign in to continue.", "UNAUTHENTICATED", 401);
  const user = await db.adminUser.findUnique({ where: { id: session.user.id } });
  if (!user || user.sessionVersion !== session.user.sessionVersion) throw new UserError("Please sign in again.", "UNAUTHENTICATED", 401);
  if (user.mustChangePassword && !allowPasswordChange) throw new UserError("Change your password before continuing.", "PASSWORD_CHANGE_REQUIRED", 403);
  return user;
}

export async function requireOwner() {
  const user = await requireAdmin();
  if (user.role !== "OWNER") throw new UserError("Only an owner can manage administrators.", "FORBIDDEN", 403);
  return user;
}
