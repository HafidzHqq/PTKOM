import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes("isi-dengan")
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          }),
        ]
      : []),
    CredentialsProvider({
      id: "guest-login",
      name: "Tamu Kost",
      credentials: {
        name: { label: "Nama", type: "text", placeholder: "Nama kamu (opsional)" },
      },
      async authorize(credentials) {
        try {
          const guestName = credentials?.name?.trim() || "Teman Kost";
          // Cari atau buat user tamu
          let guestUser = await prisma.user.findFirst({
            where: { email: "guest@gizikost.local" },
          });

          if (!guestUser) {
            guestUser = await prisma.user.create({
              data: {
                email: "guest@gizikost.local",
                name: guestName,
                gender: "male",
                age: 20,
                weightKg: 60,
                heightCm: 170,
                activityLevel: "light",
                dailyCalorieTarget: 2250,
                dailyProteinTarget: 84,
                dailyFatTarget: 62,
                dailyCarbTarget: 337,
                dailyFiberTarget: 25,
                bmr: 1540,
                tdee: 2117.5,
                monthlyFoodBudget: 900000,
                provider: "credentials",
              },
            });
          } else if (guestName !== "Teman Kost" && guestUser.name !== guestName) {
            try {
              guestUser = await prisma.user.update({
                where: { id: guestUser.id },
                data: { name: guestName },
              });
            } catch {
              // keep existing guestUser if update fails
            }
          }

          return {
            id: String(guestUser.id),
            name: guestUser.name || guestName,
            email: guestUser.email || "guest@gizikost.local",
          };
        } catch (error) {
          console.error("Credentials authorize error:", error);
          return {
            id: "1",
            name: credentials?.name?.trim() || "Teman Kost",
            email: "guest@gizikost.local",
          };
        }
      },
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = Number(token.id);
        } else if (token.email) {
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
