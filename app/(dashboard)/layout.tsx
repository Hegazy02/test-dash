import type { Metadata } from "next";
import { WebsiteSelector } from "@/components/main/website-selector";

export const metadata: Metadata = {
  title: "SEO Dashboard",
  description: "Manage your website SEO",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto">
      <WebsiteSelector />
      {children}
    </div>
  );
}
