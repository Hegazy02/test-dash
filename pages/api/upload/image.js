// pages\api\upload\image.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const imageAlt = formData.get("imageAlt") || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded", message: "No file uploaded" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 },
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    // Generate filename
    let fileName;
    if (
      file.name &&
      file.name !== "blob" &&
      file.name !== "undefined" &&
      file.name.length > 4
    ) {
      fileName = file.name;
    } else {
      const fileExt = path.extname(file.name || ".jpg").toLowerCase();
      fileName = imageAlt
        ? `${slugify(imageAlt)}${fileExt}`
        : `blog-${Date.now()}${fileExt}`;
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Vercel Blob
    const blob = await put(fileName, buffer, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });

    const finalFileName = blob.pathname
      ? blob.pathname.split("/").pop()
      : fileName;

    return NextResponse.json({
      success: true,
      fileUrl: blob.url,
      fileName: finalFileName,
      originalFileName: fileName,
      filePath: blob.pathname || blob.url,
    });
  } catch (error) {
    console.error("Error processing file upload:", error);
    return NextResponse.json(
      {
        error: "Failed to process file upload",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
