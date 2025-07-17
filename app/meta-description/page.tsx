import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetaDescriptionForm } from "@/components/meta-description/meta-description-form";

export const metadata: Metadata = {
  title: "Meta Description Management",
  description: "Manage meta descriptions for your websites",
};

export default function MetaDescriptionPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Meta Description Management
      </h1>
      <p className="text-muted-foreground">
        Create compelling meta descriptions to improve click-through rates.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Edit Meta Descriptions</CardTitle>
          <CardDescription>
            Update the meta descriptions for your website pages. Good
            descriptions are typically 150-160 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetaDescriptionForm />
        </CardContent>
      </Card>
    </div>
  );
}
