import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RedirectsForm } from "@/components/redirects/redirects-form";
import { WebsiteSelector } from "@/components/website-selector"; // Create this component if not exists

export const metadata: Metadata = {
  title: "Redirects Management",
  description: "Manage 301 redirects for broken pages",
};

export default function RedirectsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Redirects Management
      </h1>
      <p className="text-muted-foreground">
        Set up 301 redirects to fix broken pages and maintain SEO value.
      </p>

      <WebsiteSelector />

      <Card>
        <CardHeader>
          <CardTitle>Manage Redirects</CardTitle>
          <CardDescription>
            Create 301 redirects from broken pages (404) to new URLs to preserve
            SEO value and improve user experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RedirectsForm />
        </CardContent>
      </Card>
    </div>
  );
}
