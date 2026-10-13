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
        } catch (error) {
          // Jangan blokir login meski DB error — user tetap bisa masuk via JWT
          console.error("Error saving user to database (non-fatal):", error);
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      // Pastikan token.id selalu integer ID database MySQL
      if (user) {
        if (user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: { id: true },
            });
            if (dbUser) {
              token.id = String(dbUser.id);
            } else {
              const num = Number(user.id);
              token.id = (!isNaN(num) && num > 0 && num <= 2147483647) ? String(num) : "1";
            }
          } catch (e) {
            console.error("Error mapping token.id to dbUser id:", e);
            const num = Number(user.id);
            token.id = (!isNaN(num) && num > 0 && num <= 2147483647) ? String(num) : "1";
          }
        } else {
          const num = Number(user.id);
          token.id = (!isNaN(num) && num > 0 && num <= 2147483647) ? String(num) : "1";
        }
      } else if (!token.id || isNaN(Number(token.id)) || Number(token.id) > 2147483647) {
        // Self-heal token lama yang berisi Google sub ID raksasa (> 32-bit int)
        if (token.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email },
              select: { id: true },
            });
            if (dbUser) {
              token.id = String(dbUser.id);
            } else {
              token.id = "1";
            }
          } catch {
            token.id = "1";
          }
        } else {
          token.id = "1";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        let userId = Number(token.id);
        if (isNaN(userId) || userId <= 0 || userId > 2147483647) {
          if (token.email) {
            try {
              const existingUser = await prisma.user.findUnique({
                where: { email: token.email },
                select: { id: true },
              });
              if (existingUser) {
                userId = existingUser.id;
              }
            } catch (error) {
              console.error("Error fetching user ID for session:", error);
            }
          }
        }
        session.user.id = (userId && !isNaN(userId) && userId > 0 && userId <= 2147483647) ? userId : 1;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) {
        if (url === baseUrl || url === `${baseUrl}/`) {
          return `${baseUrl}/dashboard`;
        }
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
