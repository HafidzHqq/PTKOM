import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ClientLayout from "./client-layout";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Studio — Footer",
  description: "Fresh ideas, imagination, and creative collaboration.",
  icons: {
    icon: '/logo.svg',
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
