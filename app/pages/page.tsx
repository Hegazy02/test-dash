import type { Metadata } from "next";
import { PagesTable } from "@/components/pages/pages-table";
import { AddPageForm } from "@/components/pages/add-page-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Page Management",
  description:
    "Add and manage pages for your website with SEO optimization for both Arabic and English content",
  keywords:
    "page management, website pages, content management, SEO, Arabic content, English content",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Page Management - SEO Dashboard",
    description:
      "Manage your website pages with optimized SEO for Arabic and English content",
    type: "website",
  },
};

export default function PagesPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-[calc(100vw-2rem)] mx-auto">
      <div className="py-2 sm:py-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">
          Page Management
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Add and manage pages for your website with SEO optimization.
        </p>
      </div>

      {/* Responsive grid layout that adapts to screen size */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        {/* Card sizes adjust based on viewport width */}
        <Card className="w-full overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Add New Page</CardTitle>
            <CardDescription className="text-sm">
              Create a new page with optimized meta titles and descriptions in
              both Arabic and English.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <AddPageForm />
          </CardContent>
        </Card>

        <Card className="w-full overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Your Pages</CardTitle>
            <CardDescription className="text-sm">
              Manage your existing pages and optimize their SEO properties.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="w-full overflow-x-auto">
              <PagesTable />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
