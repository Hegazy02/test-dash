// pages\api\websites\pages.js
import dbConnect from "../../../lib/dbConnect";
import Website from "../../../models/Website";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  await dbConnect();

  const { websiteId } = req.query;

  if (!websiteId) {
    return res.status(400).json({ error: "Website ID is required" });
  }

  // GET - Fetch all pages for a website
  if (req.method === "GET") {
    try {
      const website = await Website.findById(websiteId).select("pages");

      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      // Transform the pages to include _id as id
      const pages = website.pages.map((page) => ({
        _id: page._id.toString(),
        title: page.title,
        slug: page.slug,
        metaTitleAr: page.metaTitleAr || "",
        metaTitleEn: page.metaTitleEn || "",
        metaDescriptionAr: page.metaDescriptionAr || "",
        metaDescriptionEn: page.metaDescriptionEn || "",
        content: page.content,
        status: page.status,
        lastModified: page.lastModified,
        isHomePage: page.isHomePage,
        order: page.order,
        page404from: page.page404from || null,
        RedirectPage: page.RedirectPage || null,
        is404Page: page.is404Page || false,
        uuid: page.uuid || "",
        blogID: page.blogID || "0", // ✅ إضافة blogID للاستجابة
      }));

      return res.status(200).json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      return res.status(500).json({ error: "Failed to fetch pages" });
    }
  }

  // POST - Create a new page
  if (req.method === "POST") {
    try {
      const {
        title,
        slug,
        metaTitleAr,
        metaTitleEn,
        metaDescriptionAr,
        metaDescriptionEn,
        content,
        status,
        blogID, // ✅ إضافة blogID للطلب
      } = req.body;

      // Debug request body
      console.log("Received page data:", {
        title,
        slug,
        metaTitleAr,
        metaTitleEn,
        metaDescriptionAr,
        metaDescriptionEn,
        blogID, // ✅ طباعة blogID
      });

      if (!title || !slug) {
        return res.status(400).json({ error: "Title and slug are required" });
      }

      const website = await Website.findById(websiteId);

      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      // Check if slug already exists
      const existingPage = website.pages.find((page) => page.slug === slug);
      if (existingPage) {
        return res
          .status(409)
          .json({ error: "A page with this slug already exists" });
      }

      const newPage = {
        title,
        slug,
        metaTitleAr: metaTitleAr || "",
        metaTitleEn: metaTitleEn || "",
        metaDescriptionAr: metaDescriptionAr || "",
        metaDescriptionEn: metaDescriptionEn || "",
        content: content || "",
        status: status || "draft",
        blogID: blogID || "0", // ✅ الحفاظ على blogID المرسل أو استخدام "0" كافتراضي
        lastModified: new Date(),
      };

      // Debug new page object
      console.log("Creating new page:", newPage);

      website.pages.push(newPage);
      await website.save();

      // Return the newly created page with its _id
      const createdPage = website.pages[website.pages.length - 1];
      console.log("Created page:", {
        _id: createdPage._id.toString(),
        metaTitleAr: createdPage.metaTitleAr,
        metaTitleEn: createdPage.metaTitleEn,
        metaDescriptionAr: createdPage.metaDescriptionAr,
        metaDescriptionEn: createdPage.metaDescriptionEn,
        blogID: createdPage.blogID, // ✅ طباعة blogID
      });

      return res.status(201).json({
        _id: createdPage._id.toString(),
        ...newPage,
      });
    } catch (error) {
      console.error("Error creating page:", error);
      return res.status(500).json({ error: "Failed to create page" });
    }
  }

  // DELETE - Delete a page
  if (req.method === "DELETE") {
    try {
      const { pageId } = req.query;

      if (!pageId) {
        return res.status(400).json({ error: "Page ID is required" });
      }

      const website = await Website.findById(websiteId);

      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      const pageIndex = website.pages.findIndex(
        (page) => page._id.toString() === pageId,
      );

      if (pageIndex === -1) {
        return res.status(404).json({ error: "Page not found" });
      }

      website.pages.splice(pageIndex, 1);
      await website.save();

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting page:", error);
      return res.status(500).json({ error: "Failed to delete page" });
    }
  }

  // PUT - Update a page
  if (req.method === "PUT") {
    try {
      const { pageId, pageuuid } = req.query;
      const {
        title,
        slug,
        metaTitleAr,
        metaTitleEn,
        metaDescriptionAr,
        metaDescriptionEn,
        content,
        status,
        page404from,
        RedirectPage,
        is404Page,
        blogID, // ✅ إضافة blogID للطلب
      } = req.body;

      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      // Find page by ID or UUID
      let pageIndex = -1;
      if (pageId) {
        pageIndex = website.pages.findIndex(
          (page) => page._id.toString() === pageId,
        );
      }

      // If page not found by ID and UUID exists, search by UUID
      if (pageIndex === -1 && pageuuid) {
        pageIndex = website.pages.findIndex((page) => page.uuid === pageuuid);
      }

      if (pageIndex === -1) {
        return res.status(404).json({ error: "Page not found" });
      }

      // الحفاظ على الـ uuid الموجود أو إنشاء واحد جديد
      const existingUuid = website.pages[pageIndex].uuid || uuidv4();

      // ✅ الحفاظ على blogID الموجود إذا لم يتم تمرير blogID جديد
      const existingBlogID = website.pages[pageIndex].blogID || "0";
      const finalBlogID = blogID !== undefined ? blogID : existingBlogID;

      // Rest of your existing update logic remains the same
      website.pages[pageIndex] = {
        ...website.pages[pageIndex],
        uuid: existingUuid, // ✅ إضافة الـ uuid صراحة
        title: title || website.pages[pageIndex].title,
        slug: slug || website.pages[pageIndex].slug,
        metaTitleAr:
          metaTitleAr !== undefined
            ? metaTitleAr
            : website.pages[pageIndex].metaTitleAr,
        metaTitleEn:
          metaTitleEn !== undefined
            ? metaTitleEn
            : website.pages[pageIndex].metaTitleEn,
        metaDescriptionAr:
          metaDescriptionAr !== undefined
            ? metaDescriptionAr
            : website.pages[pageIndex].metaDescriptionAr,
        metaDescriptionEn:
          metaDescriptionEn !== undefined
            ? metaDescriptionEn
            : website.pages[pageIndex].metaDescriptionEn,
        content: content || website.pages[pageIndex].content,
        status: status || website.pages[pageIndex].status,
        page404from:
          page404from !== undefined
            ? page404from
            : website.pages[pageIndex].page404from,
        RedirectPage:
          RedirectPage !== undefined
            ? RedirectPage
            : website.pages[pageIndex].RedirectPage,
        is404Page:
          is404Page !== undefined
            ? is404Page
            : website.pages[pageIndex].is404Page,
        blogID: finalBlogID, // ✅ الحفاظ على blogID
        lastModified: new Date(),
      };

      await website.save();

      // Transform all pages to array response
      const allUpdatedPages = website.pages.map((page) => ({
        _id: page._id.toString(),
        title: page.title,
        slug: page.slug,
        metaTitleAr: page.metaTitleAr || "",
        metaTitleEn: page.metaTitleEn || "",
        metaDescriptionAr: page.metaDescriptionAr || "",
        metaDescriptionEn: page.metaDescriptionEn || "",
        content: page.content || "",
        status: page.status,
        lastModified: page.lastModified,
        isHomePage: page.isHomePage,
        order: page.order,
        page404from: page.page404from || null,
        RedirectPage: page.RedirectPage || null,
        is404Page: page.is404Page || false,
        uuid: page.uuid || uuidv4(), // ✅ التأكد من وجود uuid في الاستجابة
        blogID: page.blogID || "0", // ✅ التأكد من وجود blogID في الاستجابة
      }));
      return res.status(200).json(allUpdatedPages);
    } catch (error) {
      console.error("Error updating page:", error);
      return res.status(500).json({ error: "Failed to update page" });
    }
  }

  // PUT - Update pages for redirects
  if (req.method === "PUT") {
    try {
      const { fromPath, toPath, updateType } = req.body;
      const { websiteId } = req.query;

      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      if (updateType === "from404") {
        // Find or create the 404 source page
        let sourcePage = website.pages.find(
          (page) => page.slug === fromPath.substring(1),
        );

        const sourcePageIndex = sourcePage
          ? website.pages.indexOf(sourcePage)
          : -1;

        if (sourcePageIndex === -1) {
          // Create new 404 page if it doesn't exist
          website.pages.push({
            uuid: uuidv4(), // ✅ إضافة uuid للصفحة الجديدة
            title: `404 - ${fromPath}`,
            slug: fromPath.substring(1),
            RedirectPage: toPath,
            page404from: null,
            is404Page: true,
            status: "published",
            blogID: "0", // ✅ تعيين blogID افتراضي للصفحات الجديدة
            lastModified: new Date(),
          });
        } else {
          // Update existing page
          website.pages[sourcePageIndex] = {
            ...website.pages[sourcePageIndex],
            uuid: website.pages[sourcePageIndex].uuid || uuidv4(), // ✅ الحفاظ على uuid أو إنشاء جديد
            RedirectPage: toPath,
            page404from: null,
            is404Page: true,
            // ✅ الحفاظ على blogID الموجود
            blogID: website.pages[sourcePageIndex].blogID || "0",
            lastModified: new Date(),
          };
        }
      }

      if (updateType === "destination") {
        // Find or create the destination page
        let destPage = website.pages.find(
          (page) => page.slug === toPath.substring(1),
        );

        const destPageIndex = destPage ? website.pages.indexOf(destPage) : -1;

        if (destPageIndex === -1) {
          // Create new destination page if it doesn't exist
          website.pages.push({
            uuid: uuidv4(), // ✅ إضافة uuid للصفحة الجديدة
            title: `Redirect destination - ${toPath}`,
            slug: toPath.substring(1),
            RedirectPage: null,
            page404from: fromPath,
            is404Page: false,
            status: "published",
            blogID: "0", // ✅ تعيين blogID افتراضي للصفحات الجديدة
            lastModified: new Date(),
          });
        } else {
          // Update existing page
          website.pages[destPageIndex] = {
            ...website.pages[destPageIndex],
            uuid: website.pages[destPageIndex].uuid || uuidv4(), // ✅ الحفاظ على uuid أو إنشاء جديد
            RedirectPage: null,
            page404from: fromPath,
            is404Page: false,
            // ✅ الحفاظ على blogID الموجود
            blogID: website.pages[destPageIndex].blogID || "0",
            lastModified: new Date(),
          };
        }
      }

      await website.save();

      // إعادة تحميل الموقع مع البيانات المحدثة
      const updatedWebsite = await Website.findById(websiteId);

      // تحويل الصفحات لتنسيق متوافق مع الواجهة الأمامية
      const updatedPages = updatedWebsite.pages.map((page) => ({
        _id: page._id.toString(),
        title: page.title,
        slug: page.slug,
        metaTitleAr: page.metaTitleAr || "",
        metaTitleEn: page.metaTitleEn || "",
        metaDescriptionAr: page.metaDescriptionAr || "",
        metaDescriptionEn: page.metaDescriptionEn || "",
        content: page.content || "",
        status: page.status || "draft",
        lastModified: page.lastModified,
        isHomePage: page.isHomePage || false,
        order: page.order || 0,
        page404from: page.page404from || null,
        RedirectPage: page.RedirectPage || null,
        is404Page: page.is404Page || false,
        uuid: page.uuid || uuidv4(), // ✅ التأكد من وجود uuid
        blogID: page.blogID || "0", // ✅ التأكد من وجود blogID
      }));

      return res.status(200).json(updatedPages);
    } catch (error) {
      console.error("Error updating pages for redirect:", error);
      return res.status(500).json({ error: "Failed to update pages" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
