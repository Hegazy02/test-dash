import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SitemapManager } from "@/components/sitemap/sitemap-manager";

export const metadata: Metadata = {
  title: "Dynamic Sitemap",
  description: "Manage your website's sitemap for better SEO",
};

export default function SitemapPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Dynamic Sitemap</h1>
      <p className="text-muted-foreground">
        Manage your website's sitemap to help search engines discover and index
        your content.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Sitemap Configuration</CardTitle>
          <CardDescription>
            Your sitemap automatically updates whenever you add or modify pages
            on your website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SitemapManager />
        </CardContent>
      </Card>
    </div>
  );
}
