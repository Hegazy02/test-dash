import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SlugControlForm } from "@/components/slug-control/slug-control-form";

export const metadata: Metadata = {
  title: "Slug Control",
  description: "Manage URL slugs for your websites",
};

export default function SlugControlPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Slug Control</h1>
      <p className="text-muted-foreground">
        Optimize your URL structure with SEO-friendly slugs.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Edit URL Slugs</CardTitle>
          <CardDescription>
            Update the URL slugs for your website pages. Good slugs are short,
            descriptive, and use hyphens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SlugControlForm />
        </CardContent>
      </Card>
    </div>
  );
}
