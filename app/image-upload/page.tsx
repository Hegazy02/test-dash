import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUploadForm } from "@/components/image-upload/image-upload-form";

export const metadata: Metadata = {
  title: "Image Upload",
  description:
    "Upload and manage images for your websites with SEO optimization",
};

export default function ImageUploadPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Image Upload</h1>
      <p className="text-muted-foreground">
        Upload and manage optimized images for your websites with proper alt
        text for SEO.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Upload images and add descriptive alt text to improve accessibility
            and SEO.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
