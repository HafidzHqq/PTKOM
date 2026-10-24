import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ClientLayout from "./client-layout";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DompetKost — Kulineran Enak, Dompet Aman, Badan Nyaman",
  description:
    "Teman setia anak kost untuk eksplorasi resep hemat, lezat, dan seimbang dengan verifikasi AI serta kalkulasi nutrisi otomatis.",
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
