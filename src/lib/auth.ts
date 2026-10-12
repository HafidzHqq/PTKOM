import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name ?? null,
                image: user.image ?? null,
                provider: account.provider,
                providerId: account.providerAccountId,
              },
            });
          } else {
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name ?? existingUser.name,
                image: user.image ?? existingUser.image,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user to database:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (existingUser) {
            session.user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error fetching user ID for session:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
