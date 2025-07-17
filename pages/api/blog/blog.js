// pages/api/blog/blog.js - الملف المُحدث
import dbConnect from "../../../lib/dbConnect";
import BlogPost from "../../../models/BlogPost";
import {
  addBlogPage,
  updateBlogPage,
  deleteBlogPage,
} from "../websites/websites";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";
import path from "path";
import getRawBody from "raw-body";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to generate random filename with special characters (backup only)
function generateRandomImageName(imageAlt, fileExtension) {
  const specialChars = "@#$%^&*()_+|~`{}[]:\"';'<>?,./-=";
  const alphanumeric =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const allChars = alphanumeric + specialChars;

  let randomString = "";
  for (let i = 0; i < 15; i++) {
    randomString += allChars.charAt(
      Math.floor(Math.random() * allChars.length)
    );
  }

  const cleanImageAlt = imageAlt
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const timestamp = Date.now();
  return `${cleanImageAlt}-${timestamp}-${randomString}.${fileExtension}`;
}

// Helper function to slugify text for filenames
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// Function to upload image using Vercel Blob - محدثة لاستخدام Vercel Blob
async function uploadImageToPortfolio(file, imageAlt) {
  try {
    console.log("uploadImageToPortfolio - Starting upload...");

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size too large. Maximum size is 10MB.");
    }

    // Generate filename
    let fileName;
    if (
      file.originalFilename &&
      file.originalFilename !== "blob" &&
      file.originalFilename !== "undefined" &&
      file.originalFilename.length > 4
    ) {
      // تنظيف اسم الملف من الرموز الخاصة
      const cleanName = file.originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
      fileName = cleanName;
    } else {
      const fileExt = path
        .extname(file.originalFilename || ".jpg")
        .toLowerCase();
      fileName = imageAlt
        ? `${slugify(imageAlt)}${fileExt}`
        : `blog-${Date.now()}${fileExt}`;
    }

    console.log("Using filename:", fileName);

    // Read file buffer
    const fileBuffer = await fs.readFile(file.filepath);

    console.log(
      "uploadImageToPortfolio - File read successfully, uploading to Vercel Blob..."
    );

    // Upload to Vercel Blob
    const blob = await put(fileName, fileBuffer, {
      access: "public",
      contentType: file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true, // هذا سيضيف suffix عشوائي لتجنب تضارب الأسماء
    });

    const finalFileName = blob.pathname
      ? blob.pathname.split("/").pop()
      : fileName;

    console.log("uploadImageToPortfolio - Upload successful:", {
      fileName: finalFileName,
      fileUrl: blob.url,
    });

    return {
      success: true,
      imageUrl: blob.url,
      imagePath: blob.pathname || blob.url,
      fileName: finalFileName,
    };
  } catch (error) {
    console.error("Error uploading image to Vercel Blob:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    try {
      await fs.unlink(file.filepath);
    } catch (err) {
      console.error("Error deleting temporary file:", err);
    }
  }
}

export default async function handler(req, res) {
  await dbConnect();
  console.log("Request method:", req.method);

  if (req.method === "GET") {
    try {
      const {
        id,
        siteId,
        slug,
        limit = 10,
        page = 1,
        allBlogs,
        blogID,
      } = req.query;
      console.log("GET request parameters:", {
        id,
        siteId,
        slug,
        limit,
        page,
        allBlogs,
        blogID,
      });

      console.log("###########blodId", blogID);
      console.log("###########id", id);
      console.log("###########slug", slug);
      if (blogID) {
        const post = await BlogPost.findOne({ blogID }).lean();
        if (!post) {
          return res.status(404).json({ error: "Blog post not found" });
        }
        return res.status(200).json(post);
      }

      if (id) {
        const post = await BlogPost.findById(id).lean();
        if (!post) {
          return res.status(404).json({ error: "Blog post not found" });
        }
        return res.status(200).json(post);
      }

      if (!siteId) {
        return res.status(400).json({ error: "Site ID is required" });
      }

      if (slug) {
        const post = await BlogPost.findOne({ siteId, slug }).lean();
        if (!post) {
          return res.status(404).json({ error: "Blog post not found" });
        }
        return res.status(200).json(post);
      }

      // Special endpoint to get all blogs for slug validation
      if (allBlogs === "true") {
        const allPosts = await BlogPost.find(
          { siteId },
          { slug: 1, _id: 0 }
        ).lean();
        return res
          .status(200)
          .json({ slugs: allPosts.map((post) => post.slug) });
      }

      // Otherwise, fetch all blog posts with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const posts = await BlogPost.find({ siteId })
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await BlogPost.countDocuments({ siteId });

      return res.status(200).json({
        posts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Error in GET request:", error);
      return res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  }

  if (req.method === "POST") {
    const form = new IncomingForm();

    try {
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });

      console.log("POST - Received fields and files");
      function slugifyArabic(text) {
        return text
          .toString()
          .normalize("NFKD") // تفكيك الأحرف المشكّلة
          .replace(/[\u064B-\u065F]/g, "") // إزالة التشكيل العربي
          .replace(/[^ء-يa-zA-Z0-9\s-]/g, "") // إزالة الرموز الخاصة مع إبقاء الأحرف العربية واللاتينية
          .replace(/\s+/g, "-") // استبدال المسافات بـ "-"
          .replace(/-+/g, "-") // دمج الـ "-" المتكررة
          .replace(/^-+|-+$/g, "") // إزالة الشرط من البداية والنهاية
          .toLowerCase(); // تحويل إلى أحرف صغيرة
      }

      const blogID = uuidv4().replace(/-/g, "").substring(0, 8);
      const siteId = fields.siteId[0];
      const titleEN = fields.titleEN ? fields.titleEN[0] : "";
      const titleAR = fields.titleAR ? fields.titleAR[0] : "";
      const slug =
        fields.slug[0] ||
        slugifyArabic(fields.titleAR) ||
        slugify(fields.titleEN) ||
        `blog-${Date.now()}`;
      console.log("Generated slug:", slug);
      const blogType = fields.blogType[0]; // arabic, english, both
      const contentEN = fields.contentEN ? fields.contentEN[0] : "";
      const contentAR = fields.contentAR ? fields.contentAR[0] : "";
      const excerptEN = fields.excerptEN ? fields.excerptEN[0] : "";
      const excerptAR = fields.excerptAR ? fields.excerptAR[0] : "";
      const authorEN = fields.authorEN ? fields.authorEN[0] : "";
      const authorAR = fields.authorAR ? fields.authorAR[0] : "";
      const tagsEN = fields.tagsEN ? JSON.parse(fields.tagsEN[0]) : [];
      const tagsAR = fields.tagsAR ? JSON.parse(fields.tagsAR[0]) : [];
      const publishedAt = fields.publishedAt ? fields.publishedAt[0] : null;
      const categoryEN = fields.categoryEN ? fields.categoryEN[0] : "";
      const categoryAR = fields.categoryAR ? fields.categoryAR[0] : "";
      const imageAltEN = fields.imageAltEN ? fields.imageAltEN[0] : "";
      const imageAltAR = fields.imageAltAR ? fields.imageAltAR[0] : "";
      const isFeatured = fields.isFeatured
        ? fields.isFeatured[0] === "true"
        : false;
      console.log("POST - Parsed fields:", {
        blogID,
        siteId,
        titleEN,
        titleAR,
        slug,
        blogType,
      });
      // Check if all required fields are present before proceeding
      if (!siteId || !slug || !blogType) {
        return res
          .status(400)
          .json({ error: "siteId, slug, and blogType are required" });
      }

      // Validate required fields based on blog type
      if (blogType === "english" && (!titleEN || !contentEN || !categoryEN)) {
        return res.status(400).json({
          error:
            "Title, content, and category in English are required for English blog type",
        });
      }

      if (blogType === "arabic" && (!titleAR || !contentAR || !categoryAR)) {
        return res.status(400).json({
          error:
            "Title, content, and category in Arabic are required for Arabic blog type",
        });
      }

      if (
        blogType === "both" &&
        (!titleEN ||
          !titleAR ||
          !contentEN ||
          !contentAR ||
          !categoryEN ||
          !categoryAR)
      ) {
        return res.status(400).json({
          error:
            "All titles, content, and categories in both languages are required for bilingual blog type",
        });
      }

      // Check featured blogs limit before creating
      if (isFeatured) {
        const featuredCount = await BlogPost.countDocuments({
          siteId: siteId,
          isFeatured: true,
        });

        if (featuredCount >= 3) {
          return res.status(400).json({
            error:
              "Maximum 3 featured blogs allowed. Please unfeature an existing blog first.",
          });
        }
      }

      let featuredImage = "";
      let uploadStatus = { success: true };

      // Only upload image if all validation passes
      if (files.featuredImage) {
        const file = files.featuredImage[0];

        console.log("POST - File info:", {
          originalFilename: file.originalFilename,
          newFilename: file.newFilename,
          mimetype: file.mimetype,
          size: file.size,
        });

        const imageAlt = imageAltEN || imageAltAR || "";
        uploadStatus = await uploadImageToPortfolio(file, imageAlt);

        if (uploadStatus.success) {
          featuredImage = uploadStatus.imageUrl;

          console.log("POST - Upload successful:", {
            fileName: uploadStatus.fileName,
            imageUrl: uploadStatus.imageUrl,
          });
        } else {
          console.error("POST - Upload failed:", uploadStatus.error);
          return res.status(500).json({
            error: `Failed to upload image: ${uploadStatus.error}`,
          });
        }
      }

      const post = await BlogPost.create({
        siteId,
        blogID,
        titleEN,
        titleAR,
        slug,
        blogType,
        contentEN,
        contentAR,
        excerptEN,
        excerptAR,
        authorEN,
        authorAR,
        tagsEN,
        tagsAR,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        categoryEN,
        categoryAR,
        imageAltEN,
        imageAltAR,
        featuredImage,
        isFeatured,
      });

      // إصلاح استدعاء addBlogPage - إضافة title مطلوب
      try {
        console.log("Attempting to add blog page with data:", {
          uuid: uuidv4(),
          title: titleEN || titleAR,
          titleEN,
          titleAR,
          slug,
          metaTitleEN: titleEN,
          metaTitleAR: titleAR,
          metaDescriptionEN: excerptEN,
          metaDescriptionAR: excerptAR,
          contentEN,
          contentAR,
          blogType,
          blogID,
          status: publishedAt ? "published" : "draft",
        });

        await addBlogPage(siteId, {
          uuid: uuidv4(),
          title: titleEN || titleAR,
          titleEN,
          titleAR,
          slug,
          metaTitleEN: titleEN,
          metaTitleAR: titleAR,
          metaDescriptionEN: excerptEN,
          metaDescriptionAR: excerptAR,
          contentEN,
          contentAR,
          blogType,
          blogID,
          status: publishedAt ? "published" : "draft",
        });

        console.log("Blog page added successfully");
      } catch (error) {
        console.error(
          "Failed to add blog page, but continuing...",
          error.message
        );
        // لا نوقف العملية، نكمل بدون إضافة الصفحة للموقع
      }

      return res.status(201).json({
        ...post.toObject(),
        uploadStatus: uploadStatus.success ? "success" : "failed",
      });
    } catch (error) {
      console.error("Error in POST request:", error);
      return res.status(500).json({
        error: `Failed to create blog post: ${error.message}`,
      });
    }
  }

  // PUT - Update an existing blog post
  if (req.method === "PUT") {
    const form = new IncomingForm();

    try {
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });

      console.log("PUT - Received fields and files");

      const blogID = fields.blogID ? fields.blogID[0] : null;
      const id = fields.id ? fields.id[0] : null;
      const siteId = fields.siteId[0];
      const titleEN = fields.titleEN ? fields.titleEN[0] : "";
      const titleAR = fields.titleAR ? fields.titleAR[0] : "";
      const slug = fields.slug[0];
      const blogType = fields.blogType[0];
      const contentEN = fields.contentEN ? fields.contentEN[0] : "";
      const contentAR = fields.contentAR ? fields.contentAR[0] : "";
      const excerptEN = fields.excerptEN ? fields.excerptEN[0] : "";
      const excerptAR = fields.excerptAR ? fields.excerptAR[0] : "";
      const authorEN = fields.authorEN ? fields.authorEN[0] : "";
      const authorAR = fields.authorAR ? fields.authorAR[0] : "";
      const tagsEN = fields.tagsEN ? JSON.parse(fields.tagsEN[0]) : [];
      const tagsAR = fields.tagsAR ? JSON.parse(fields.tagsAR[0]) : [];
      const publishedAt = fields.publishedAt ? fields.publishedAt[0] : null;
      const categoryEN = fields.categoryEN ? fields.categoryEN[0] : "";
      const categoryAR = fields.categoryAR ? fields.categoryAR[0] : "";
      const imageAltEN = fields.imageAltEN ? fields.imageAltEN[0] : "";
      const imageAltAR = fields.imageAltAR ? fields.imageAltAR[0] : "";
      const isFeatured = fields.isFeatured
        ? fields.isFeatured[0] === "true"
        : false;

      if ((!blogID && !id) || !siteId) {
        return res
          .status(400)
          .json({ error: "Post ID (blogID or id) and siteId are required" });
      }

      // Find the post by blogID or _id
      let post;
      if (blogID) {
        post = await BlogPost.findOne({ blogID });
      } else {
        post = await BlogPost.findById(id);
      }

      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // Check featured blogs limit for updates
      if (isFeatured && !post.isFeatured) {
        const featuredCount = await BlogPost.countDocuments({
          siteId: siteId,
          isFeatured: true,
          _id: { $ne: post._id }, // Exclude current post
        });

        if (featuredCount >= 3) {
          return res.status(400).json({
            error:
              "Maximum 3 featured blogs allowed. Please unfeature an existing blog first.",
          });
        }
      }

      let featuredImage = fields.featuredImage
        ? fields.featuredImage[0]
        : post.featuredImage;
      let uploadStatus = { success: true };

      // Handle image upload to Vercel Blob
      if (files.featuredImage) {
        const file = files.featuredImage[0];

        console.log("PUT - File info:", {
          originalFilename: file.originalFilename,
          newFilename: file.newFilename,
          mimetype: file.mimetype,
          size: file.size,
        });

        const imageAlt = imageAltEN || imageAltAR || "";
        uploadStatus = await uploadImageToPortfolio(file, imageAlt);

        if (uploadStatus.success) {
          featuredImage = uploadStatus.imageUrl;

          console.log("PUT - Upload successful:", {
            fileName: uploadStatus.fileName,
            imageUrl: uploadStatus.imageUrl,
          });
        } else {
          console.error("PUT - Upload failed:", uploadStatus.error);
          return res.status(500).json({
            error: `Failed to upload image: ${uploadStatus.error}`,
          });
        }
      }

      // Update the blog post
      const updatedPost = await BlogPost.findByIdAndUpdate(
        post._id,
        {
          titleEN,
          titleAR,
          slug,
          blogType,
          contentEN,
          contentAR,
          excerptEN,
          excerptAR,
          authorEN,
          authorAR,
          tagsEN,
          tagsAR,
          publishedAt: publishedAt ? new Date(publishedAt) : null,
          categoryEN,
          categoryAR,
          imageAltEN,
          imageAltAR,
          featuredImage,
          isFeatured,
        },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      try {
        // إصلاح استدعاء updateBlogPage - إضافة title مطلوب
        await updateBlogPage(siteId, post._id, {
          title: titleEN || titleAR, // إضافة الحقل المطلوب
          titleEN,
          titleAR,
          slug,
          metaTitleEN: titleEN,
          metaTitleAR: titleAR,
          metaDescriptionEN: excerptEN,
          metaDescriptionAR: excerptAR,
          contentEN,
          contentAR,
          blogType,
          status: publishedAt ? "published" : "draft",
        });
      } catch (error) {
        console.error("Error updating blog page:", error);
      }

      return res.status(200).json({
        ...updatedPost.toObject(),
        uploadStatus: uploadStatus.success ? "success" : "failed",
      });
    } catch (error) {
      console.error("Error updating blog post:", error);
      return res.status(500).json({
        error: `Failed to update blog post: ${error.message}`,
      });
    }
  }

  // DELETE - Delete a blog post
  if (req.method === "DELETE") {
    try {
      // نحصل على البيانات الخام من الجسم
      const rawBody = await getRawBody(req);
      const body = JSON.parse(rawBody.toString());

      console.log(" backend parsed body:", body);

      const { blogID, id, siteId } = body;

      if ((!blogID && !id) || !siteId) {
        return res
          .status(400)
          .json({ error: "Post ID (blogID or id) and siteId are required" });
      }

      // ابحث عن المقالة إما باستخدام blogID أو _id
      console.log("blogID", blogID);
      console.log("id", id);
      let post;
      if (blogID) {
        post = await BlogPost.findOne({ blogID });
      } else {
        post = await BlogPost.findById(id);
      }
      console.log("post", post);

      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // حذف المقالة
      await BlogPost.findByIdAndDelete(post._id);
      console.log("Blog post deleted successfully");
      await deleteBlogPage(siteId, blogID);
      console.log("Blog post deleted successfully 2222222222");

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error in DELETE request:", error);
      return res.status(500).json({ error: "Failed to delete blog post" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(405).json({ error: "Method not allowed" });
}
