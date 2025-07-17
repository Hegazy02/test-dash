"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save, AlertCircle } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/rich-text-editor";
import { slugify } from "@/lib/utils";
import { WebsiteSelector } from "@/components/blog-website-selector";
import { useWebsiteStore } from "@/lib/store/website-store";

const formSchema = z
  .object({
    siteId: z.string().min(1, { message: "Website is required" }),
    titleEN: z.string().optional(),
    titleAR: z.string().optional(),
    slug: z.string().optional(),
    blogType: z.enum(["arabic", "english", "both"], {
      message: "Please select blog type",
    }),
    contentEN: z.string().optional(),
    contentAR: z.string().optional(),
    excerptEN: z
      .string()
      .max(160, { message: "English excerpt should be 160 characters or less" })
      .optional(),
    excerptAR: z
      .string()
      .max(160, { message: "Arabic excerpt should be 160 characters or less" })
      .optional(),
    authorEN: z.string().optional(),
    authorAR: z.string().optional(),
    tagsEN: z.string().optional(),
    tagsAR: z.string().optional(),
    status: z.enum(["draft", "published"], {
      message: "Please select a status",
    }),
    featuredImage: z.string().optional(),
    imageAltEN: z.string().optional(),
    imageAltAR: z.string().optional(),
    categoryEN: z.string().optional(),
    categoryAR: z.string().optional(),
    isFeatured: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // التحقق من المحتوى والعناوين حسب نوع المدونة
      if (data.blogType === "english") {
        return (
          data.contentEN &&
          data.contentEN.length >= 2 &&
          data.titleEN &&
          data.titleEN.length >= 3 &&
          data.categoryEN &&
          data.categoryEN.length >= 1
        );
      }
      if (data.blogType === "arabic") {
        return (
          data.contentAR &&
          data.contentAR.length >= 2 &&
          data.titleAR &&
          data.titleAR.length >= 3 &&
          data.categoryAR &&
          data.categoryAR.length >= 1
        );
      }
      if (data.blogType === "both") {
        return (
          data.contentEN &&
          data.contentEN.length >= 2 &&
          data.contentAR &&
          data.contentAR.length >= 2 &&
          data.titleEN &&
          data.titleEN.length >= 3 &&
          data.titleAR &&
          data.titleAR.length >= 3 &&
          data.categoryEN &&
          data.categoryEN.length >= 1 &&
          data.categoryAR &&
          data.categoryAR.length >= 1
        );
      }
      return true;
    },
    {
      message:
        "Please fill all required fields based on the selected blog type",
      path: [], // تحريك رسالة الخطأ إلى أسفل النموذج
    },
  );

// Define the type for the form values
type FormValues = z.infer<typeof formSchema>;

const predefinedCategories = [
  {
    nameEN: "Media Production",
    nameAR: "الإنتاج الإعلامي",
    slug: "media-production",
  },
  {
    nameEN: "Event Management",
    nameAR: "إدارة الفعاليات",
    slug: "event-management",
  },
  {
    nameEN: "Booth Production",
    nameAR: "إنتاج المعارض",
    slug: "booth-production",
  },
  { nameEN: "Printing", nameAR: "الطباعة", slug: "printing" },
];

interface BlogPost {
  _id: string;
  blogID: string;
  siteId: string;
  titleEN?: string;
  titleAR?: string;
  slug: string;
  blogType: "arabic" | "english" | "both";
  contentEN?: string;
  contentAR?: string;
  excerptEN?: string;
  excerptAR?: string;
  authorEN?: string;
  authorAR?: string;
  tagsEN?: string[];
  tagsAR?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  featuredImage?: string;
  imageAltEN?: string;
  imageAltAR?: string;
  categoryEN?: string;
  categoryAR?: string;
  isFeatured?: boolean;
}

interface BlogPostFormProps {
  post?: BlogPost;
  isEdit?: boolean;
}

export function BlogPostForm({ post, isEdit = false }: BlogPostFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState("");
  const { selectedWebsite } = useWebsiteStore();
  const [newCategoryEN, setNewCategoryEN] = useState("");
  const [newCategoryAR, setNewCategoryAR] = useState("");
  const [categories, setCategories] = useState(predefinedCategories);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageFilename, setImageFilename] = useState("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [existingSlugs, setExistingSlugs] = useState<string[]>([]);
  const [featuredBlogsCount, setFeaturedBlogsCount] = useState(0);
  const [slugError, setSlugError] = useState("");

  // Prepare default values based on whether this is an edit form or new form
  const defaultValues: FormValues =
    isEdit && post
      ? {
          siteId: post.siteId,
          titleEN: post.titleEN || "",
          titleAR: post.titleAR || "",
          slug: post.slug,
          blogType: post.blogType,
          contentEN: post.contentEN || "",
          contentAR: post.contentAR || "",
          excerptEN: post.excerptEN || "",
          excerptAR: post.excerptAR || "",
          authorEN: post.authorEN || "",
          authorAR: post.authorAR || "",
          tagsEN: post.tagsEN ? post.tagsEN.join(", ") : "",
          tagsAR: post.tagsAR ? post.tagsAR.join(", ") : "",
          status: post.publishedAt ? "published" : "draft",
          featuredImage: post.featuredImage || "",
          imageAltEN: post.imageAltEN || "",
          imageAltAR: post.imageAltAR || "",
          categoryEN: post.categoryEN || "",
          categoryAR: post.categoryAR || "",
          isFeatured: post.isFeatured || false,
        }
      : {
          siteId: selectedWebsite?.id || "",
          titleEN: "",
          titleAR: "",
          slug: "",
          blogType: "english",
          contentEN: "",
          contentAR: "",
          excerptEN: "",
          excerptAR: "",
          authorEN: "",
          authorAR: "",
          tagsEN: "",
          tagsAR: "",
          status: "draft",
          featuredImage: "",
          imageAltEN: "",
          imageAltAR: "",
          categoryEN: "",
          categoryAR: "",
          isFeatured: false,
        };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Watch blogType to conditionally show content fields
  const blogType = form.watch("blogType");

  // جلب البيانات الموجودة عند تحديد الموقع
  useEffect(() => {
    if (selectedWebsite) {
      fetchExistingBlogs();
    }
  }, [selectedWebsite]);

  // جلب جميع المدونات الموجودة
  const fetchExistingBlogs = async () => {
    if (!selectedWebsite) return;

    try {
      const response = await fetch(
        `/api/blog/blog?siteId=${selectedWebsite.id}&limit=1000`,
      );

      if (response.ok) {
        const data = await response.json();
        const slugs = data.posts.map((post: any) => post.slug);
        const featuredCount = data.posts.filter(
          (post: any) => post.isFeatured,
        ).length;

        setExistingSlugs(slugs);
        setFeaturedBlogsCount(featuredCount);
      }
    } catch (error) {
      console.error("Error fetching existing blogs:", error);
    }
  };

  // Update siteId when selectedWebsite changes (only for new posts)
  useEffect(() => {
    if (!isEdit && selectedWebsite) {
      form.setValue("siteId", selectedWebsite.id);
    }
  }, [selectedWebsite, form, isEdit]);

  // Generate slug from title
  useEffect(() => {
    const titleEN = form.watch("titleEN");
    const titleAR = form.watch("titleAR");
    const title = titleEN || titleAR || "";
    if (title) {
      setGeneratedSlug(slugify(title));
    }
  }, [form.watch("titleEN"), form.watch("titleAR")]);

  // Load predefined categories on startup
  useEffect(() => {
    setCategories(predefinedCategories);
  }, []);

  const generateFilename = (imageAlt: string, fileExtension: string) => {
    const now = new Date();

    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear().toString();

    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    const currentDate = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;

    // إنشاء رقم عشوائي مع رموز خاصة
    const specialChars = "@#$%^&*()_+|~`{}[]:\";'<>?,./-=";
    const numbers = "0123456789";
    const allChars = specialChars + numbers;

    let randomString = "";
    for (let i = 0; i < 8; i++) {
      randomString += allChars.charAt(
        Math.floor(Math.random() * allChars.length),
      );
    }

    const cleanImageAlt = imageAlt
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    return `${cleanImageAlt}-${currentDate}-${randomString}.${fileExtension}`;
  };

  // دالة للحصول على النص المناسب لاسم الملف
  const getImageAltOrTitle = () => {
    const currentImageAltEN = form.getValues("imageAltEN");
    const currentImageAltAR = form.getValues("imageAltAR");
    const currentTitleEN = form.getValues("titleEN");
    const currentTitleAR = form.getValues("titleAR");

    // أولاً: استخدم imageAlt إذا كان متوفراً
    if (currentImageAltEN) return currentImageAltEN;
    if (currentImageAltAR) return currentImageAltAR;

    // ثانياً: استخدم العنوان الإنجليزي
    if (currentTitleEN) return currentTitleEN;

    // ثالثاً: استخدم العنوان العربي
    if (currentTitleAR) return currentTitleAR;

    // إذا لم يكن هناك أي شيء، استخدم نص افتراضي
    return "blog-image";
  };

  // دالة لإعادة توليد اسم الملف
  const regenerateFilename = () => {
    if (!originalFile) return;

    const imageAltOrTitle = getImageAltOrTitle();
    const fileExtension = originalFile.name.split(".").pop() || "jpg";
    const uniqueFilename = generateFilename(imageAltOrTitle, fileExtension);

    // إنشاء ملف جديد بالاسم الجديد
    const renamedFile = new File([originalFile], uniqueFilename, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });

    // تحديث جميع المتغيرات
    setSelectedImage(renamedFile);
    setImageFilename(uniqueFilename);
    form.setValue("featuredImage", uniqueFilename);

    // إضافة إشعار للمستخدم
    toast({
      title: "Filename regenerated",
      description: `New filename: ${uniqueFilename}`,
    });
  };

  // تعديل دالة handleImageUpload - عدم رفع الصورة فوراً
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFile(file);

      const imageAltOrTitle = getImageAltOrTitle();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const uniqueFilename = generateFilename(imageAltOrTitle, fileExtension);

      const renamedFile = new File([file], uniqueFilename, {
        type: file.type,
        lastModified: file.lastModified,
      });

      setSelectedImage(renamedFile);
      setImageFilename(uniqueFilename);
      form.setValue("featuredImage", uniqueFilename);

      // إشعار المستخدم أن الصورة لن يتم رفعها حتى يتم حفظ المقال
      toast({
        title: "Image selected",
        description: "Image will be uploaded when you save the blog post.",
      });
    }
  };

  // مراقبة تغييرات imageAlt لتحديث اسم الملف
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        (name === "imageAltEN" ||
          name === "imageAltAR" ||
          name === "titleEN" ||
          name === "titleAR") &&
        originalFile
      ) {
        const imageAltOrTitle = getImageAltOrTitle();
        const fileExtension = originalFile.name.split(".").pop() || "jpg";
        const uniqueFilename = generateFilename(imageAltOrTitle, fileExtension);

        const renamedFile = new File([originalFile], uniqueFilename, {
          type: originalFile.type,
          lastModified: originalFile.lastModified,
        });

        setSelectedImage(renamedFile);
        setImageFilename(uniqueFilename);
        form.setValue("featuredImage", uniqueFilename);
      }

      // مراقبة تغييرات الـ slug للتحقق من وجوده
      if (name === "slug") {
        const slug = value.slug;
        if (
          slug &&
          existingSlugs.includes(slug) &&
          (!isEdit || post?.slug !== slug)
        ) {
          setSlugError("هذا الـ slug مستخدم بالفعل في مقال آخر");
        } else {
          setSlugError("");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, originalFile, existingSlugs, isEdit, post?.slug]);

  const handleAddCategory = () => {
    if (
      (newCategoryEN || newCategoryAR) &&
      !categories.some(
        (cat) =>
          cat.nameEN.toLowerCase() === newCategoryEN.toLowerCase() ||
          cat.nameAR === newCategoryAR,
      )
    ) {
      const newCat = {
        nameEN: newCategoryEN || newCategoryAR,
        nameAR: newCategoryAR || newCategoryEN,
        slug: slugify(newCategoryEN || newCategoryAR),
      };
      setCategories((prev) => [...prev, newCat]);
      form.setValue("categoryEN", newCat.nameEN);
      form.setValue("categoryAR", newCat.nameAR);
      setNewCategoryEN("");
      setNewCategoryAR("");
    }
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      // التحقق من الأخطاء قبل المتابعة
      if (slugError) {
        toast({
          title: "Error",
          description: "يرجى إصلاح أخطاء الـ slug قبل الحفظ",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Replace white and gray colors with black for both content fields
      let modifiedContentEN = values.contentEN || "";
      let modifiedContentAR = values.contentAR || "";

      const whiteAndGrayColors = [
        'color="#fafafa"',
        'color="#ffffff"',
        'color="#fff"',
        'color="#f5f5f5"',
        'color="#e5e5e5"',
        'color="#d4d4d4"',
        'color="#a3a3a3"',
        'color="#737373"',
        'color="#525252"',
        'color="#404040"',
        'color="#262626"',
      ];

      whiteAndGrayColors.forEach((color) => {
        modifiedContentEN = modifiedContentEN.replace(
          new RegExp(color, "g"),
          'color="#000000"',
        );
        modifiedContentAR = modifiedContentAR.replace(
          new RegExp(color, "g"),
          'color="#000000"',
        );
      });

      // استخدام الـ slug مباشرة من القيم (تم التحقق من فرادته مسبقاً)
      let finalSlug = values.slug || generatedSlug;

      // Create FormData object for file upload
      const formData = new FormData();

      if (isEdit && post) {
        formData.append("blogID", post.blogID);
      }

      formData.append("siteId", values.siteId);
      formData.append("slug", finalSlug);
      formData.append("blogType", values.blogType);

      // إضافة البيانات حسب نوع المدونة
      if (values.blogType === "english" || values.blogType === "both") {
        if (values.titleEN) formData.append("titleEN", values.titleEN);
        if (modifiedContentEN) formData.append("contentEN", modifiedContentEN);
        if (values.excerptEN) formData.append("excerptEN", values.excerptEN);
        if (values.authorEN) formData.append("authorEN", values.authorEN);
        if (values.tagsEN)
          formData.append(
            "tagsEN",
            JSON.stringify(values.tagsEN.split(",").map((tag) => tag.trim())),
          );
        if (values.imageAltEN) formData.append("imageAltEN", values.imageAltEN);
        if (values.categoryEN) formData.append("categoryEN", values.categoryEN);
      }

      if (values.blogType === "arabic" || values.blogType === "both") {
        if (values.titleAR) formData.append("titleAR", values.titleAR);
        if (modifiedContentAR) formData.append("contentAR", modifiedContentAR);
        if (values.excerptAR) formData.append("excerptAR", values.excerptAR);
        if (values.authorAR) formData.append("authorAR", values.authorAR);
        if (values.tagsAR)
          formData.append(
            "tagsAR",
            JSON.stringify(values.tagsAR.split(",").map((tag) => tag.trim())),
          );
        if (values.imageAltAR) formData.append("imageAltAR", values.imageAltAR);
        if (values.categoryAR) formData.append("categoryAR", values.categoryAR);
      }

      if (values.status === "published")
        formData.append("publishedAt", new Date().toISOString());
      formData.append("isFeatured", values.isFeatured.toString());

      // رفع الصورة فقط عند إرسال النموذج النهائي
      if (selectedImage) {
        // استخدام selectedImage مباشرة لأنه يحتوي على الاسم المحدث
        formData.append("featuredImage", selectedImage);

        toast({
          title: "Uploading image",
          description: "Uploading image to portfolio site...",
        });
      } else if (values.featuredImage) {
        formData.append("featuredImage", values.featuredImage);
      }

      const response = await fetch("/api/blog/blog", {
        method: isEdit ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to ${isEdit ? "update" : "create"} blog post: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();

      if (data.uploadStatus === "success" && selectedImage) {
        toast({
          title: "Image uploaded successfully",
          description:
            "The image was successfully uploaded to the portfolio site.",
        });
      }

      toast({
        title: isEdit ? "Blog post updated" : "Blog post created",
        description: `Your blog post has been ${isEdit ? "updated" : "created"} successfully.`,
        variant: "default",
      });

      router.push("/blog");
    } catch (error) {
      console.error(
        `Error ${isEdit ? "updating" : "creating"} blog post:`,
        error,
      );
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

  const getCurrentImageAltOrTitle = () => {
    const currentImageAltEN = form.getValues("imageAltEN");
    const currentImageAltAR = form.getValues("imageAltAR");
    const currentTitleEN = form.getValues("titleEN");
    const currentTitleAR = form.getValues("titleAR");

    if (currentImageAltEN || currentImageAltAR) return true;
    if (currentTitleEN || currentTitleAR) return true;
    return false;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Blog Language Selection - First Field */}
        <FormField
          control={form.control}
          name="blogType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Blog Language <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="p-6 border-2 border-input rounded-lg bg-background">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Select the Language
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Choose which language(s) you want to write your blog
                        post in
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <label
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          field.value === "english"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            value="english"
                            checked={field.value === "english"}
                            onChange={field.onChange}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <div className="font-medium text-foreground">
                              English Only
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Write content in English language
                            </div>
                          </div>
                        </div>
                        <div className="w-8 h-6 rounded overflow-hidden shadow-sm">
                          <img
                            src="https://flagcdn.com/w80/us.png"
                            alt="US Flag"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </label>

                      <label
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          field.value === "arabic"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            value="arabic"
                            checked={field.value === "arabic"}
                            onChange={field.onChange}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <div className="font-medium text-foreground">
                              العربية فقط
                            </div>
                            <div className="text-sm text-muted-foreground">
                              كتابة المحتوى باللغة العربية
                            </div>
                          </div>
                        </div>
                        <div className="w-8 h-6 rounded overflow-hidden shadow-sm">
                          <img
                            src="https://flagcdn.com/w80/sa.png"
                            alt="Saudi Arabia Flag"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </label>

                      <label
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          field.value === "both"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            value="both"
                            checked={field.value === "both"}
                            onChange={field.onChange}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <div className="font-medium text-foreground">
                              Both Languages / كلا اللغتين
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Write content in both English and Arabic
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-8 h-6 rounded overflow-hidden shadow-sm">
                            <img
                              src="https://flagcdn.com/w80/us.png"
                              alt="US Flag"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="w-8 h-6 rounded overflow-hidden shadow-sm">
                            <img
                              src="https://flagcdn.com/w80/sa.png"
                              alt="Saudi Arabia Flag"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                This selection determines which content fields will be shown and
                required.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEdit ? (
          <FormField
            control={form.control}
            name="siteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Website <span className="text-red-500">*</span>
                </FormLabel>
                <WebsiteSelector
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {/* Title Fields - مع إضافة عداد الأحرف */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {(blogType === "english" || blogType === "both") && (
            <FormField
              control={form.control}
              name="titleEN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title (English) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter blog post title in English"
                        {...field}
                        dir="ltr"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(blogType === "arabic" || blogType === "both") && (
            <FormField
              control={form.control}
              name="titleAR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    العنوان (العربية) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="أدخل عنوان المقال باللغة العربية"
                        {...field}
                        dir="rtl"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={generatedSlug || "Enter custom slug"}
                    {...field}
                    className={slugError ? "border-destructive" : ""}
                  />
                </div>
              </FormControl>
              <FormDescription>
                The URL-friendly version of the title.
                {!isEdit && " Leave blank to auto-generate from title."}
              </FormDescription>
              {slugError && (
                <p className="text-destructive text-sm flex items-center">
                  <AlertCircle className="h-3 w-3 ml-1" />
                  {slugError}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Alt Text Fields */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {(blogType === "english" || blogType === "both") && (
            <FormField
              control={form.control}
              name="imageAltEN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Alt Text (English)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter image description in English"
                      dir="ltr"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isEdit) {
                          const onlyEnglishAndNumbers = value.replace(
                            /[^a-zA-Z0-9\s]/g,
                            "",
                          );
                          field.onChange(onlyEnglishAndNumbers);
                        } else {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the image in English for search engines
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(blogType === "arabic" || blogType === "both") && (
            <FormField
              control={form.control}
              name="imageAltAR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نص بديل للصورة (العربية)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="أدخل وصف الصورة باللغة العربية"
                      dir="rtl"
                    />
                  </FormControl>
                  <FormDescription>
                    وصف مختصر للصورة باللغة العربية لمحركات البحث
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="featuredImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {isEdit && post?.featuredImage && !selectedImage && (
                    <p className="text-sm text-muted-foreground">
                      Current image: {post.featuredImage.split("/").pop()}
                    </p>
                  )}
                  {selectedImage && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isEdit ? "New image: " : ""}
                        {imageFilename}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={regenerateFilename}
                        disabled={!originalFile}
                      >
                        🎲 Generate New Filename
                      </Button>
                    </div>
                  )}
                  {originalFile && !getCurrentImageAltOrTitle() && (
                    <span className="text-amber-600 text-sm">
                      Please enter image alt text or a title to generate the
                      image filename
                    </span>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Choose a featured image for the article. Image will be uploaded
                when you save the post. Filename will be generated from image
                alt text, or title if alt text is not provided.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Fields */}
        <div className="space-y-4">
          <FormLabel>
            Category <span className="text-red-500">*</span>
          </FormLabel>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {(blogType === "english" || blogType === "both") && (
              <FormField
                control={form.control}
                name="categoryEN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (English)</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="">Select English category</option>
                        {categories.map((cat) => (
                          <option key={`en-${cat.slug}`} value={cat.nameEN}>
                            {cat.nameEN}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(blogType === "arabic" || blogType === "both") && (
              <FormField
                control={form.control}
                name="categoryAR"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التصنيف (العربية)</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        dir="rtl"
                      >
                        <option value="">اختر التصنيف العربي</option>
                        {categories.map((cat) => (
                          <option key={`ar-${cat.slug}`} value={cat.nameAR}>
                            {cat.nameAR}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {(blogType === "english" || blogType === "both") && (
              <div className="flex gap-2">
                <Input
                  placeholder="New English category"
                  value={newCategoryEN}
                  onChange={(e) => setNewCategoryEN(e.target.value)}
                  dir="ltr"
                />
              </div>
            )}
            {(blogType === "arabic" || blogType === "both") && (
              <div className="flex gap-2">
                <Input
                  placeholder="تصنيف عربي جديد"
                  value={newCategoryAR}
                  onChange={(e) => setNewCategoryAR(e.target.value)}
                  dir="rtl"
                />
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddCategory}
            disabled={!newCategoryEN && !newCategoryAR}
            className="w-full"
          >
            Add Category / إضافة تصنيف
          </Button>
        </div>

        {/* Content Fields - بدون حد أقصى للأحرف */}
        <div className="space-y-8">
          {(blogType === "english" || blogType === "both") && (
            <FormField
              control={form.control}
              name="contentEN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Content (English) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Write your blog post content in English here..."
                      className="min-h-[300px]"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormDescription>
                    The main content of your blog post in English.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(blogType === "arabic" || blogType === "both") && (
            <FormField
              control={form.control}
              name="contentAR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    المحتوى (العربية) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="اكتب محتوى مقالتك باللغة العربية هنا..."
                      className="min-h-[300px]"
                      dir="rtl"
                    />
                  </FormControl>
                  <FormDescription>
                    {blogType === "both"
                      ? "المحتوى الرئيسي لمقالتك باللغة العربية."
                      : "المحتوى الرئيسي لمقالتك باللغة العربية."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Excerpt Fields - مع تحديد الحد الأقصى للأحرف */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {(blogType === "english" || blogType === "both") && (
            <FormField
              control={form.control}
              name="excerptEN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt (English)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Brief summary of your blog post in English"
                        className="resize-none"
                        {...field}
                        dir="ltr"
                        maxLength={160}
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {field.value?.length || 0}/160 characters
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    A short summary in English (max 160 characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(blogType === "arabic" || blogType === "both") && (
            <FormField
              control={form.control}
              name="excerptAR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المقتطف (العربية)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="ملخص قصير لمقالتك باللغة العربية"
                        className="resize-none"
                        {...field}
                        dir="rtl"
                        maxLength={160}
                      />
                      <div className="text-xs text-muted-foreground text-left">
                        {field.value?.length || 0}/160 حرف
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    ملخص قصير باللغة العربية (بحد أقصى 160 حرف).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Author Fields */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {(blogType === "english" || blogType === "both") && (
            <FormField
              control={form.control}
              name="authorEN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author (English)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter author name in English"
                      {...field}
                      dir="ltr"
                    />
                  </FormControl>
                  <FormDescription>
                    The name of the blog post author in English.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(blogType === "arabic" || blogType === "both") && (
            <FormField
              control={form.control}
              name="authorAR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكاتب (العربية)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل اسم الكاتب باللغة العربية"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormDescription>
                    اسم كاتب المقال باللغة العربية.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Tags Fields */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {(blogType === "english" || blogType === "both") && (
            <FormField
              control={form.control}
              name="tagsEN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (English)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter English tags separated by commas"
                      {...field}
                      dir="ltr"
                    />
                  </FormControl>
                  <FormDescription>
                    Add English tags (e.g., SEO, Marketing, Tips).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(blogType === "arabic" || blogType === "both") && (
            <FormField
              control={form.control}
              name="tagsAR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العلامات (العربية)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل العلامات العربية مفصولة بفواصل"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormDescription>
                    أضف علامات عربية (مثل: تحسين محركات البحث، تسويق، نصائح).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Publication Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="draft" />
                    </FormControl>
                    <FormLabel className="font-normal">Save as Draft</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="published" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {isEdit ? "Publish" : "Publish Immediately"}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Featured Post</FormLabel>
                <FormDescription>
                  Mark this post as featured to highlight it on your website
                  {featuredBlogsCount >= 3 && !field.value && (
                    <span className="block text-amber-600 mt-1">
                      ⚠️ بالفعل يوجد 3 مدونات مميزة. لا يمكن إضافة المزيد.
                    </span>
                  )}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={featuredBlogsCount >= 3 && !field.value}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* رسالة الخطأ العامة في أسفل النموذج */}
        {form.formState.errors.root && (
          <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
            <div className="text-destructive text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {form.formState.errors.root.message}
            </div>
            <div className="text-destructive text-xs mt-2">
              Please check all required fields based on your selected blog type:
              <ul className="list-disc list-inside mt-1 space-y-1">
                {blogType === "english" && (
                  <>
                    <li>English title (required, max 60 characters)</li>
                    <li>English content (required, minimum 10 characters)</li>
                    <li>English category (required)</li>
                  </>
                )}
                {blogType === "arabic" && (
                  <>
                    <li>Arabic title (required, max 60 characters)</li>
                    <li>Arabic content (required, minimum 10 characters)</li>
                    <li>Arabic category (required)</li>
                  </>
                )}
                {blogType === "both" && (
                  <>
                    <li>
                      Both English and Arabic titles (required, max 60
                      characters each)
                    </li>
                    <li>
                      Both English and Arabic content (required, minimum 10
                      characters each)
                    </li>
                    <li>Both English and Arabic categories (required)</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/blog")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Update Blog Post"
                : "Save Blog Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
