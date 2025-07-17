"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/rich-text-editor";

// Mock data - in a real app, this would come from MongoDB
const pages = [
  { id: "1", url: "/home", title: "Home Page" },
  { id: "2", url: "/about", title: "About Us" },
  { id: "3", url: "/services", title: "Our Services" },
  { id: "4", url: "/contact", title: "Contact Us" },
  { id: "5", url: "/blog", title: "Blog" },
];

const formSchema = z.object({
  pageId: z.string().min(1, { message: "Please select a page" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export function TextEditorForm() {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  // Mock content for demo - in a real app, this would come from MongoDB
  const [pageContent, setPageContent] = useState({
    "1": "<h2>Welcome to Our Website</h2><p>This is the home page content.</p><h3>Our Mission</h3><p>We strive to provide the best service to our customers.</p>",
    "2": "<h2>About Our Company</h2><p>Learn more about our history and values.</p><h3>Our Team</h3><p>Meet the people behind our success.</p>",
    "3": "<h2>Services We Offer</h2><p>Explore our range of services.</p><h3>Custom Solutions</h3><p>Tailored to meet your specific needs.</p>",
    "4": "<h2>Contact Information</h2><p>Get in touch with our team.</p><h3>Office Locations</h3><p>Find us around the world.</p>",
    "5": "<h2>Latest Articles</h2><p>Read our latest blog posts.</p><h3>Industry Insights</h3><p>Expert analysis and commentary.</p>",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageId: "",
      content: "",
    },
  });

  const onPageChange = (pageId: string) => {
    setSelectedPage(pageId);
    form.setValue("pageId", pageId);
    form.setValue(
      "content",
      pageContent[pageId as keyof typeof pageContent] || "",
    );
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would save to MongoDB
    console.log(values);

    // Update the mock content
    if (values.pageId) {
      setPageContent({
        ...pageContent,
        [values.pageId]: values.content,
      });
    }

    toast({
      title: "Content updated",
      description: "Your changes have been saved successfully.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Page</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  onChange={(e) => onPageChange(e.target.value)}
                >
                  <option value="">Select a page</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title} ({page.url})
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedPage && (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Content</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Start typing your content here..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={
            !selectedPage ||
            !form.formState.isValid ||
            form.formState.isSubmitting
          }
        >
          <Save className="mr-2 h-4 w-4" />
          Save Content
        </Button>
      </form>
    </Form>
  );
}
