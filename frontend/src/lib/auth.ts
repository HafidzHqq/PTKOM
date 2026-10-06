import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const db = await getDb();
          // Check if user exists
          const existingUser = await db.get(
            "SELECT id FROM users WHERE email = ?",
            [user.email],
          );

          if (!existingUser) {
            // Insert new user
            await db.run(
              "INSERT INTO users (email, name, image, provider, provider_id) VALUES (?, ?, ?, ?, ?)",
              [
                user.email,
                user.name,
                user.image,
                account.provider,
                account.providerAccountId,
              ],
            );
          } else {
            // Update existing user's name and image if they changed
            await db.run(
              "UPDATE users SET name = ?, image = ? WHERE email = ?",
              [user.name, user.image, user.email],
            );
          }
          return true;
        } catch (error) {
          console.error("Error saving user to database:", error);
          return false; // Deny sign in if database error
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        try {
          const db = await getDb();
          const existingUser = await db.get(
            "SELECT id FROM users WHERE email = ?",
            [token.email],
          );
          if (existingUser) {
            // Add user ID to session
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
