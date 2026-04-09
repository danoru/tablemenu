import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@data/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { error: "/login", signIn: "/login" },
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
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
