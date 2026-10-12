import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ClientLayout from "./client-layout";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DompetKost — Asisten Gizi Anak Kost",
  description: "Hitung nutrisi makanan harian dan dapatkan rekomendasi makanan sehat ramah kantong anak kost.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClientLayout fontClassName={font.className}>
        {children}
      </ClientLayout>
    </html>
  );
}
