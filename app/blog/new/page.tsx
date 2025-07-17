import type { Metadata } from "next";
import { BlogPostForm } from "@/components/blog/blog-post-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create New Blog Post",
  description: "Create a new SEO-optimized blog post for your website",
};

export default function NewBlogPostPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Blog Post
          </h1>
          <p className="text-muted-foreground">
            Create a new SEO-optimized blog post for your website.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Post Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new blog post. All fields
            marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogPostForm isEdit={false} />
        </CardContent>
      </Card>
    </div>
  );
}
