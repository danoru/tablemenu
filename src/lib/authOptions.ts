import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { rateLimit } from "@/lib/rateLimit";
import prisma from "@data/db";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** Best-effort client IP from the headers next-auth hands authorize(). */
function loginIp(headers: Record<string, unknown> | undefined): string {
  const forwarded = headers?.["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = typeof raw === "string" ? raw.split(",")[0]?.trim() : "";
  return first || "unknown";
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { error: "/login", signIn: "/login" },
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) return null;
        // Registration is rate-limited; without this, login was the one door
        // left open to full-speed password guessing. Per-username so a name
        // can't be hammered from many IPs, per-IP with headroom so one bad
        // actor on a shared game-night network doesn't lock the whole table
        // out. Thrown messages surface as the sign-in error.
        const username = credentials.username.toLowerCase();
        if (
          !rateLimit(`login:ip:${loginIp(req?.headers)}`, 30, LOGIN_WINDOW_MS) ||
          !rateLimit(`login:user:${username}`, 10, LOGIN_WINDOW_MS)
        ) {
          throw new Error("Too many sign-in attempts. Please try again in a few minutes.");
        }
        try {
          const user = await prisma.users.findUnique({
            where: { username: credentials.username },
          });
          if (!user) return null;
          const passwordCorrect = await compare(credentials.password, user.password || "");
          if (passwordCorrect) return { id: user.id.toString(), username: user.username };
          return null;
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.user) session.user = token.user;
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) token.user = user;
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
