import type { Metadata } from "next";
import { WebsitesTable } from "@/components/website/websites-table";
import { AddWebsiteForm } from "@/components/website/add-website-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Website Management",
  description: "Add and manage websites for SEO tracking",
};

export default function WebsitesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Website Management
        </h1>
        <p className="text-muted-foreground">
          Add and manage websites for SEO tracking.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Website</CardTitle>
            <CardDescription>
              Add a new website to track its SEO performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddWebsiteForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Websites</CardTitle>
            <CardDescription>Manage your existing websites.</CardDescription>
          </CardHeader>
          <CardContent>
            <WebsitesTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
