import { NextAuthOptions } from "next-auth"; // 1. Added type import
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const cleanEmail = credentials.email.toLowerCase().trim();

        // Fetch or create user in Prisma DB
        let user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: cleanEmail,
              name: cleanEmail.split("@")[0],
            },
          });
        }

        // Returns user including `id` and `createdAt`
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },

  // ==========================================
  // 👉 ADD CALLBACKS HERE
  // ==========================================
  callbacks: {
    // Step A: Runs upon login. 'user' is only present on initial login/signup.
    async jwt({ token, user }) {
      if (user) {
        // If the user object already has createdAt, attach it directly
        if ((user as any).createdAt) {
          token.createdAt = new Date((user as any).createdAt).toISOString();
        } else if (token.email) {
          // Fallback: If logged in via Google, fetch createdAt from the database
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { createdAt: true },
          });
          if (dbUser?.createdAt) {
            token.createdAt = dbUser.createdAt.toISOString();
          }
        }
      }
      return token;
    },

    // Step B: Runs whenever useSession() is called on the frontend.
    async session({ session, token }) {
      if (session.user && token.createdAt) {
        // Pass createdAt from the JWT token into the client session object
        (session.user as any).createdAt = token.createdAt;
      }
      return session;
    },
  },
};