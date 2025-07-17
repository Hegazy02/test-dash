"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Eye, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useWebsiteStore } from "@/lib/store/website-store";

interface BlogPost {
  _id: string;
  blogID: string;
  siteId: string;
  titleEN?: string;
  titleAR?: string;
  slug: string;
  blogType: "arabic" | "english" | "both";
  excerptEN?: string;
  excerptAR?: string;
  authorEN?: string;
  authorAR?: string;
  contentEN?: string;
  contentAR?: string;
  tagsEN?: string[];
  tagsAR?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function BlogPostList() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedWebsite } = useWebsiteStore();

  useEffect(() => {
    if (selectedWebsite) {
      fetchBlogPosts(1);
    }
  }, [selectedWebsite]);

  async function fetchBlogPosts(page: number = 1, limit: number = 10) {
    if (!selectedWebsite) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/blog/blog?siteId=${selectedWebsite.id}&page=${page}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }

      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deletePost(blogID: string) {
    if (!selectedWebsite) {
      toast({
        title: "Error",
        description: "No website selected",
        variant: "destructive",
      });
      return;
    }
    console.log("Deleting post with ID:", blogID);
    try {
      const response = await fetch("/api/blog/blog", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogID,
          siteId: selectedWebsite.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }

      // Refetch posts to update the list
      await fetchBlogPosts(currentPage);

      toast({
        title: "Post deleted",
        description: "The blog post has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete blog post",
        variant: "destructive",
      });
    }
  }

  // Helper function to get the display title based on blog type
  const getDisplayTitle = (post: BlogPost) => {
    if (post.blogType === "english") {
      return post.titleEN || "Untitled";
    } else if (post.blogType === "arabic") {
      return post.titleAR || "بدون عنوان";
    } else {
      // For 'both' type, show both titles
      return `${post.titleEN || "Untitled"} / ${post.titleAR || "بدون عنوان"}`;
    }
  };

  // Helper function to get the display excerpt based on blog type
  const getDisplayExcerpt = (post: BlogPost) => {
    if (post.blogType === "english") {
      return post.excerptEN || "";
    } else if (post.blogType === "arabic") {
      return post.excerptAR || "";
    } else {
      // For 'both' type, prefer English excerpt, fallback to Arabic
      return post.excerptEN || post.excerptAR || "";
    }
  };

  // Helper function to get the display author based on blog type
  const getDisplayAuthor = (post: BlogPost) => {
    if (post.blogType === "english") {
      return post.authorEN || "";
    } else if (post.blogType === "arabic") {
      return post.authorAR || "";
    } else {
      // For 'both' type, prefer English author, fallback to Arabic
      return post.authorEN || post.authorAR || "";
    }
  };

  const filteredPosts = posts.filter((post) => {
    const title = getDisplayTitle(post).toLowerCase();
    const excerpt = getDisplayExcerpt(post).toLowerCase();
    const author = getDisplayAuthor(post).toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      title.includes(searchLower) ||
      excerpt.includes(searchLower) ||
      author.includes(searchLower) ||
      post.blogID.toLowerCase().includes(searchLower)
    );
  });

  if (!selectedWebsite) {
    return <div>Please select a website first</div>;
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No blog posts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.blogID}>
                      <TableCell className="font-medium">
                        <div>
                          <div
                            className={
                              post.blogType === "arabic"
                                ? "text-right"
                                : "text-left"
                            }
                          >
                            {getDisplayTitle(post)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getDisplayExcerpt(post)}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            ID: {post.blogID}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getDisplayAuthor(post) || "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {post.blogType === "english" && "🇺🇸 EN"}
                          {post.blogType === "arabic" && "🇸🇦 AR"}
                          {post.blogType === "both" && "🌍 EN/AR"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            post.publishedAt
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {post.publishedAt ? "published" : "draft"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/blog/${post.blogID}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`https://${selectedWebsite.domain}/blogs/${post.slug}`}
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this post?",
                                )
                              ) {
                                deletePost(post.blogID);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBlogPosts(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {pagination.pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBlogPosts(currentPage + 1)}
                disabled={currentPage >= pagination.pages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
