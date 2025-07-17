"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

interface Page {
  _id: string;
  title: string;
  slug: string;
  lastModified: string;
}

const formSchema = z.object({
  search: z.string().optional(),
  pages: z.array(
    z.object({
      _id: z.string(),
      title: z.string(),
      slug: z
        .string()
        .min(1, { message: "Slug is required" })
        .regex(/^[a-z0-9-]+$/, {
          message:
            "Slug can only contain lowercase letters, numbers, and hyphens",
        }),
    }),
  ),
});

export function SlugControlForm() {
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedWebsite } = useWebsiteStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
      pages: [],
    },
  });

  useEffect(() => {
    if (selectedWebsite) {
      fetchPages();
    }
  }, [selectedWebsite]);

  async function fetchPages() {
    if (!selectedWebsite) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/websites/pages?websiteId=${selectedWebsite.id}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }

      const data = await response.json();
      setPages(data);
      setFilteredPages(data);

      form.reset({
        search: "",
        pages: data.map((page: Page) => ({
          _id: page._id,
          title: page.title,
          slug: page.slug,
        })),
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch pages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedWebsite) {
      toast({
        title: "Error",
        description: "No website selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = values.pages.map((page) =>
        fetch(
          `/api/websites/pages?websiteId=${selectedWebsite.id}&pageId=${page._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              slug: page.slug,
            }),
          },
        ),
      );

      await Promise.all(promises);

      toast({
        title: "Slugs updated",
        description: "Your changes have been saved successfully.",
      });

      fetchPages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update slugs",
        variant: "destructive",
      });
    }
  }

  function handleSearch(value: string) {
    if (!value) {
      setFilteredPages(pages);
      return;
    }

    const filtered = pages.filter(
      (page) =>
        page.title.toLowerCase().includes(value.toLowerCase()) ||
        page.slug.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredPages(filtered);
  }

  if (!selectedWebsite) {
    return <div>Please select a website first</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search Pages</FormLabel>
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or slug..."
                    className="pl-8"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleSearch(e.target.value);
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Title</TableHead>
                  <TableHead>Current Slug</TableHead>
                  <TableHead>New Slug</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No pages found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page, index) => (
                    <TableRow key={page._id}>
                      <TableCell className="font-medium">
                        {page.title}
                      </TableCell>
                      <TableCell>/{page.slug}</TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`pages.${index}.slug`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center">
                                <span className="mr-1">/</span>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <input
                          type="hidden"
                          {...form.register(`pages.${index}._id`)}
                          value={page._id}
                        />
                        <input
                          type="hidden"
                          {...form.register(`pages.${index}.title`)}
                          value={page.title}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
