"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash2, Eye, EyeOff, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Mobile card view component for small screens
const MobilePageCard = ({
  page,
  onStatusToggle,
  onDelete,
}: {
  page: any;
  onStatusToggle: (id: string, status: string) => void;
  onDelete: (id: string, title: string, slug: string) => void;
}) => {
  return (
    <div className="mb-4 p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-base">{page.title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(page._id, page.title, page.slug)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mb-1">/{page.slug}</div>

      <div className="grid grid-cols-2 gap-2 my-2 text-sm">
        <div>
          <div className="font-semibold mb-1">Meta Title (AR)</div>
          <div className="text-xs truncate" dir="rtl">
            {page.metaTitleAr || "غير محدد"}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-1">Meta Title (EN)</div>
          <div className="text-xs truncate">
            {page.metaTitleEn || "Not set"}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3">
        <Badge
          variant={page.status === "published" ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => onStatusToggle(page._id, page.status)}
        >
          {page.status === "published" ? (
            <Eye className="h-3 w-3 mr-1" />
          ) : (
            <EyeOff className="h-3 w-3 mr-1" />
          )}
          {page.status}
        </Badge>
        <div className="text-xs">
          {format(new Date(page.lastModified), "MMM d, yyyy")}
        </div>
      </div>
    </div>
  );
};

export function PagesTable() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { pages, fetchPages, isLoading, error, selectedWebsite } =
    useWebsiteStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{
    id: string;
    title: string;
    slug: string;
  } | null>(null);

  useEffect(() => {
    if (selectedWebsite?.id) {
      fetchPages(selectedWebsite.id);
    }
  }, [fetchPages, selectedWebsite]);

  const toggleRowExpansion = (pageId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(pageId)) {
      newExpandedRows.delete(pageId);
    } else {
      newExpandedRows.add(pageId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleDelete = async (id: string) => {
    if (!selectedWebsite?.id) return;

    try {
      const response = await fetch(
        `/api/websites/pages?websiteId=${selectedWebsite.id}&pageId=${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete page");
      }

      // Refresh the pages list
      await fetchPages(selectedWebsite.id);

      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete page",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  const handleStatusToggle = async (pageId: string, currentStatus: string) => {
    if (!selectedWebsite?.id) return;

    const newStatus = currentStatus === "draft" ? "published" : "draft";

    try {
      const response = await fetch(
        `/api/websites/pages?websiteId=${selectedWebsite.id}&pageId=${pageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update page status");
      }

      // Refresh the pages list
      await fetchPages(selectedWebsite.id);

      toast({
        title: "Status updated",
        description: `Page status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update page status",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (id: string, title: string, slug: string) => {
    setPageToDelete({ id, title, slug });
    setDeleteDialogOpen(true);
  };

  if (!selectedWebsite) {
    return (
      <div className="text-center py-4 text-sm sm:text-base">
        Please select a website to manage its pages.
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="text-sm">{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-4 text-sm sm:text-base">
        Loading pages...
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-4 text-sm sm:text-base">
        No pages found. Add your first page to get started.
      </div>
    );
  }

  return (
    <>
      {/* Desktop view - shown on medium screens and larger */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Meta Titles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="whitespace-nowrap">
                  Last Modified
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page._id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-sm">/{page.slug}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {expandedRows.has(page._id) ? (
                        <div
                          className="text-xs space-y-1 cursor-pointer"
                          onClick={() => toggleRowExpansion(page._id)}
                        >
                          <div>
                            <strong>AR:</strong> {page.metaTitleAr || "Not set"}
                          </div>
                          <div>
                            <strong>EN:</strong> {page.metaTitleEn || "Not set"}
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(page._id)}
                          className="w-fit p-1 h-auto text-xs"
                        >
                          Show Titles
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={
                          page.status === "published" ? "default" : "secondary"
                        }
                        className="cursor-pointer w-fit"
                        onClick={() =>
                          handleStatusToggle(page._id, page.status)
                        }
                      >
                        {page.status === "published" ? (
                          <Eye className="h-3 w-3 mr-1" />
                        ) : (
                          <EyeOff className="h-3 w-3 mr-1" />
                        )}
                        {page.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(page.lastModified), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        openDeleteDialog(page._id, page.title, page.slug)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile view - shown on small screens */}
      <div className="md:hidden">
        <Accordion type="single" collapsible className="w-full">
          {pages.map((page, index) => (
            <AccordionItem key={page._id} value={`page-${index}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      page.status === "published" ? "default" : "secondary"
                    }
                    className="h-6"
                  >
                    {page.status}
                  </Badge>
                  <span className="font-medium truncate">{page.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-1 space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">URL Path</div>
                    <div className="text-sm text-muted-foreground">
                      /{page.slug}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">
                      Meta Title (Arabic)
                    </div>
                    <div className="text-sm text-muted-foreground" dir="rtl">
                      {page.metaTitleAr || "غير محدد"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">
                      Meta Title (English)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {page.metaTitleEn || "Not set"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">
                      Last Modified
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(page.lastModified), "MMM d, yyyy")}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusToggle(page._id, page.status)}
                    >
                      {page.status === "published" ? "Unpublish" : "Publish"}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        openDeleteDialog(page._id, page.title, page.slug)
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[350px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-destructive">
              Delete Page
            </DialogTitle>
            <div className="text-center">
              <DialogDescription>
                Are you sure you want to delete this page?
              </DialogDescription>
              <div className="mt-2 text-sm text-foreground">
                <div>
                  <strong>Title:</strong> {pageToDelete?.title}
                </div>
                <div>
                  <strong>Slug:</strong> /{pageToDelete?.slug}
                </div>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPageToDelete(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => pageToDelete && handleDelete(pageToDelete.id)}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
