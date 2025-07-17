import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPostNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Blog Post Not Found
      </h1>
      <p className="text-muted-foreground mb-6">
        The blog post you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/blog">Return to Blog Management</Link>
      </Button>
    </div>
  );
}
