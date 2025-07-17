import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostForm } from "@/components/blog/blog-post-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Edit Blog Post",
  description: "Edit an existing blog post and optimize it for SEO",
};

async function getBlogPost(blogID: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    console.log("Fetching blog post with blogID:", blogID);
    console.log("Using base URL:", baseUrl);

    const url = `${baseUrl}/api/blog/blog?blogID=${blogID}`;
    console.log("Full URL:", url);
    console.log("Full blogID:", blogID);

    const response = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("Blog post not found (404)");
        return {
          success: false,
          error: "Blog post not found",
        };
      }
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to fetch blog post: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    console.log("Successfully fetched blog post with blogID:", data.blogID);
    return {
      success: true,
      post: data,
    };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch blog post",
    };
  }
}

interface PageProps {
  params: {
    id: string; // This will actually be the blogID
  };
}

export default async function EditBlogPostPage({ params }: PageProps) {
  if (!params?.id) {
    notFound();
  }

  const blogID = params.id;
  const result = await getBlogPost(blogID);

  if (!result.success || !result.post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
          <p className="text-muted-foreground">
            Update your blog post and optimize it for search engines.
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Blog ID: {result.post.blogID}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Post Details</CardTitle>
          <CardDescription>
            Update the details below to edit your blog post. All fields marked
            with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogPostForm post={result.post} isEdit={true} />
        </CardContent>
      </Card>
    </div>
  );
}
