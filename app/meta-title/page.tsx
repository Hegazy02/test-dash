import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetaTitleForm } from "@/components/meta-title/meta-title-form";

export const metadata: Metadata = {
  title: "Meta Title Management",
  description: "Manage meta titles for your websites in Arabic and English",
};

export default function MetaTitlePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Meta Title Management
      </h1>
      <p className="text-muted-foreground">
        Optimize your meta titles in both Arabic and English for better search
        engine visibility.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Edit Meta Titles</CardTitle>
          <CardDescription>
            Update the meta titles for your website pages in both Arabic and
            English. Good titles are typically 50-60 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetaTitleForm />
        </CardContent>
      </Card>
    </div>
  );
}
