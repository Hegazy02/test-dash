import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SEO Management Dashboard",
    template: "%s | SEO Management Dashboard",
  },
  description: "Manage SEO for multiple websites in one place",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
