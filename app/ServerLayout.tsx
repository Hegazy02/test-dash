// app/ServerLayout.tsx
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout"; // تأكد من تعديل المسار حسب هيكل مشروعك

export const metadata: Metadata = {
  title: {
    default: "SEO Management Dashboard",
    template: "%s | SEO Management Dashboard",
  },
  description: "Manage SEO for multiple websites in one place",
};

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
