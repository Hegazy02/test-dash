import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlogPostList } from "@/components/blog/blog-post-list";

export const metadata: Metadata = {
  title: "Blog Management",
  description: "Manage blog posts for your websites",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts with SEO optimization.
          </p>
        </div>
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            Manage your blog posts and optimize them for search engines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogPostList />
        </CardContent>
      </Card>
    </div>
  );
}
