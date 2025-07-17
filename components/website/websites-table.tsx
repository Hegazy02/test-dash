"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

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

export function WebsitesTable() {
  const { toast } = useToast();
  const { websites, fetchWebsites, isLoading } = useWebsiteStore();

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this website? This action cannot be undone.",
      )
    ) {
      try {
        const response = await fetch(`/api/websites/websites?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete website");
        }

        // Refresh the websites list
        await fetchWebsites();

        toast({
          title: "Website deleted",
          description: "The website has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to delete website",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading websites...</div>;
  }

  if (websites.length === 0) {
    return (
      <div className="text-center py-4">
        No websites found. Add your first website to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {websites.map((website) => {
            console.log(website);
            return (
              <TableRow key={website.id}>
                <TableCell className="font-medium">{website.name}</TableCell>
                <TableCell>{website.domain}</TableCell>
                <TableCell>
                  {format(new Date(website.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(website.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
