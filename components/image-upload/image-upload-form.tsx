"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImagePlus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { uploadImage } from "@/app/actions/upload-image";
import { useWebsiteStore } from "@/lib/store/website-store";

// Mock data - in a real app, this would come from MongoDB
const pages = [
  { id: "1", url: "/home", title: "Home Page" },
  { id: "2", url: "/about", title: "About Us" },
  { id: "3", url: "/services", title: "Our Services" },
  { id: "4", url: "/contact", title: "Contact Us" },
  { id: "5", url: "/blog", title: "Blog" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  pageUrl: z.string().min(1, { message: "Please select a page" }),
  altText: z
    .string()
    .min(1, { message: "Alt text is required for accessibility and SEO" }),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
});

type FormValues = z.infer<typeof formSchema>;

export function ImageUploadForm() {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const selectedWebsite = useWebsiteStore((state) => state.selectedWebsite);

  // Mock data for existing images - in a real app, this would come from MongoDB
  const [existingImages, setExistingImages] = useState([
    {
      id: "1",
      url: "/placeholder.svg?height=200&width=300",
      alt: "Hero image for the home page",
      page: "/home",
    },
    {
      id: "2",
      url: "/placeholder.svg?height=200&width=300",
      alt: "Team photo on the about page",
      page: "/about",
    },
    {
      id: "3",
      url: "/placeholder.svg?height=200&width=300",
      alt: "Service illustration",
      page: "/services",
    },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageUrl: "",
      altText: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("websiteId", selectedWebsite?.id || "");
    formData.append("pageUrl", data.pageUrl);
    formData.append("altText", data.altText);
    formData.append("file", data.file);

    try {
      const result = await uploadImage(formData);

      if (result.success) {
        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully.",
        });

        // Add the new image to the list of existing images
        if (result.image) {
          setExistingImages([
            ...existingImages,
            {
              id: Date.now().toString(),
              url: result.image.url,
              alt: result.image.alt,
              page: data.pageUrl,
            },
          ]);
        }

        // Reset the form
        form.reset();
        setPreview(null);
      } else {
        toast({
          title: "Upload failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the image.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size and type
    if (file.size > MAX_FILE_SIZE) {
      form.setError("file", { message: "Max file size is 5MB." });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      form.setError("file", {
        message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
      });
      return;
    }

    // Set the file in the form
    form.setValue("file", file, { shouldValidate: true });

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id: string) => {
    // In a real app, this would delete from MongoDB
    setExistingImages(existingImages.filter((image) => image.id !== id));
    toast({
      title: "Image removed",
      description: "The image has been removed successfully.",
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Page</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="">Select a page</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.url}>
                        {page.title} ({page.url})
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
                <FormControl>
                  <div className="grid w-full gap-4">
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6 text-center">
                      {preview ? (
                        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg">
                          <Image
                            src={preview || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 300px"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => {
                              setPreview(null);
                              form.resetField("file");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <ImagePlus className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <p className="text-sm font-medium">
                              Drag and drop your image here
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JPG, JPEG, PNG, or WebP (max. 5MB)
                            </p>
                          </div>
                          <Input
                            id="file"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="cursor-pointer"
                            onChange={handleFileChange}
                            {...fieldProps}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="altText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alt Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the image for screen readers and SEO"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of the image for accessibility
                  and SEO purposes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Images</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {existingImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium">Page: {image.page}</p>
                <p
                  className="mt-1 text-xs text-muted-foreground line-clamp-2"
                  title={image.alt}
                >
                  Alt: {image.alt}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => removeImage(image.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
