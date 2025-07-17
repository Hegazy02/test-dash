import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextEditorForm } from "@/components/text-editor/text-editor-form";

export const metadata: Metadata = {
  title: "Text Editor",
  description: "Edit content with SEO-friendly headings",
};

export default function TextEditorPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Text Editor</h1>
      <p className="text-muted-foreground">
        Create and edit content with proper heading structure for better SEO.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Content Editor</CardTitle>
          <CardDescription>
            Use H2 and H3 headings to structure your content for better SEO and
            readability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextEditorForm />
        </CardContent>
      </Card>
    </div>
  );
}
