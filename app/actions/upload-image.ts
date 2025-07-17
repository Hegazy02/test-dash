"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Website from "@/models/Website";

export async function uploadImage(formData: FormData) {
  try {
    await dbConnect();

    const websiteId = formData.get("websiteId") as string;
    const pageUrl = formData.get("pageUrl") as string;
    const altText = formData.get("altText") as string;
    const file = formData.get("file") as File;

    if (!websiteId || !pageUrl || !altText || !file) {
      return { success: false, message: "Missing required fields" };
    }

    // In a real implementation, you would:
    // 1. Upload the file to a storage service (S3, Cloudinary, etc.)
    // 2. Get the URL of the uploaded file
    // 3. Save the URL and alt text to MongoDB

    // Mock implementation for demo purposes
    const imageUrl = URL.createObjectURL(file);

    // Update the website document in MongoDB
    const website = await Website.findById(websiteId);
    if (!website) {
      return { success: false, message: "Website not found" };
    }

    // Find the page and add the image
    const page = website.pages.find((p: any) => p.url === pageUrl);
    if (page) {
      page.images.push({
        url: imageUrl,
        alt: altText,
      });
    } else {
      // If page doesn't exist, create it
      website.pages.push({
        url: pageUrl,
        title: "New Page",
        slug: pageUrl.replace("/", ""),
        images: [
          {
            url: imageUrl,
            alt: altText,
          },
        ],
      });
    }

    await website.save();
    revalidatePath("/image-upload");

    return {
      success: true,
      message: "Image uploaded successfully",
      image: { url: imageUrl, alt: altText },
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, message: "Failed to upload image" };
  }
}
