"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWebsiteStore } from "@/lib/store/website-store";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Page title must be at least 2 characters.",
  }),
  slug: z
    .string()
    .min(2, {
      message: "Slug must be at least 2 characters.",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  metaTitleAr: z
    .string()
    .max(60, {
      message: "Meta title (Arabic) must be less than 60 characters.",
    })
    .optional()
    .or(z.literal("")),
  metaTitleEn: z
    .string()
    .min(1, {
      message: "Meta title (English) is required.",
    })
    .max(60, {
      message: "Meta title (English) must be less than 60 characters.",
    }),
  metaDescriptionAr: z
    .string()
    .max(160, {
      message: "Meta description (Arabic) must be less than 160 characters.",
    })
    .optional()
    .or(z.literal("")),
  metaDescriptionEn: z
    .string()
    .max(160, {
      message: "Meta description (English) must be less than 160 characters.",
    })
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(10, {
      message: "Content must be at least 10 characters.",
    })
    .optional()
    .or(z.literal("")),

  status: z.enum(["draft", "published"]),
});

type FormValues = z.infer<typeof formSchema>;

export function AddPageForm() {
  const { toast } = useToast();
  const { fetchPages, selectedWebsite } = useWebsiteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      metaTitleAr: "",
      metaTitleEn: "",
      metaDescriptionAr: "",
      metaDescriptionEn: "",
      content: "",
      status: "published",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!selectedWebsite?.id) {
      toast({
        title: "Error",
        description: "Please select a website first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Make sure to use the title as default for empty meta titles
    const formattedValues = {
      ...values,
      metaTitleAr: values.metaTitleAr || values.title,
      metaTitleEn: values.metaTitleEn || values.title,
      metaDescriptionAr:
        values.metaDescriptionAr || `${values.title} - ${selectedWebsite.name}`,
      metaDescriptionEn:
        values.metaDescriptionEn || `${values.title} - ${selectedWebsite.name}`,
    };

    // Debug the values being submitted
    console.log("Submitting page with values:", formattedValues);

    try {
      const response = await fetch(
        `/api/websites/pages?websiteId=${selectedWebsite.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        },
      );

      // Also log the response for debugging
      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to add page");
      }

      toast({
        title: "Page added",
        description: "Your page has been added successfully.",
      });

      form.reset();

      // Refresh the pages list
      await fetchPages(selectedWebsite.id);
    } catch (error) {
      console.error("Error adding page:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!selectedWebsite) {
    return (
      <div className="text-center py-4 text-sm sm:text-base">
        Please select a website to add pages.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Page Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="About Us"
                  {...field}
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </FormControl>
              <FormDescription className="text-xs sm:text-sm">
                This is the display title for your page.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">URL Slug</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-2 top-[calc(50%-8px)] h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="about-us"
                    className="pl-8 text-sm sm:text-base h-9 sm:h-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs sm:text-sm">
                Enter the URL slug for this page (e.g., about-us).
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Responsive grid that adapts to screen size */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Meta Title Fields */}
            <FormField
              control={form.control}
              name="metaTitleAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Meta Title (Arabic)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="عنوان الصفحة - اسم الشركة"
                      dir="rtl"
                      {...field}
                      className="text-sm sm:text-base h-9 sm:h-10"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormDescription className="text-xs sm:text-sm mt-1">
                      عنوان SEO بالعربية
                    </FormDescription>
                    <div className="text-xs text-muted-foreground">
                      {field.value.length}/60
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaTitleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Meta Title (English)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="About Us - Company Name"
                      {...field}
                      className="text-sm sm:text-base h-9 sm:h-10"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormDescription className="text-xs sm:text-sm mt-1">
                      SEO title in English
                    </FormDescription>
                    <div className="text-xs text-muted-foreground">
                      {field.value.length}/60
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Meta Description Fields */}
            <FormField
              control={form.control}
              name="metaDescriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Meta Description (Arabic)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="تعرف على المزيد عن شركتنا ومهمتنا..."
                      dir="rtl"
                      {...field}
                      className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormDescription className="text-xs sm:text-sm mt-1">
                      وصف SEO بالعربية
                    </FormDescription>
                    <div className="text-xs text-muted-foreground">
                      {field.value.length}/160
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Meta Description (English)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Learn more about our company and our mission..."
                      {...field}
                      className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormDescription className="text-xs sm:text-sm mt-1">
                      SEO description in English
                    </FormDescription>
                    <div className="text-xs text-muted-foreground">
                      {field.value.length}/160
                    </div>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Status</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </FormControl>
              <FormDescription className="text-xs sm:text-sm">
                Set the page status.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
        >
          {isSubmitting ? "Adding..." : "Add Page"}
        </Button>
      </form>
    </Form>
  );
}
