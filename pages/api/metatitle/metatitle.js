import dbConnect from "../../../lib/dbConnect";
import MetaTitle from "../../../models/MetaTitle";

export default async function handler(req, res) {
  await dbConnect();

  const { siteId } = req.query;

  if (!siteId) {
    return res.status(400).json({ error: "Site ID is required" });
  }

  // GET - Fetch all meta titles for a site
  if (req.method === "GET") {
    try {
      const metaTitles = await MetaTitle.find({ siteId })
        .sort({ updatedAt: -1 })
        .lean();

      return res.status(200).json(metaTitles);
    } catch (error) {
      console.error("Error fetching meta titles:", error);
      return res.status(500).json({ error: "Failed to fetch meta titles" });
    }
  }

  // POST - Create or update a meta title
  if (req.method === "POST") {
    try {
      const { url, metaTitleAr, metaTitleEn } = req.body;

      if (!url || !metaTitleAr || !metaTitleEn) {
        return res
          .status(400)
          .json({ error: "URL, Arabic title, and English title are required" });
      }

      const metaTitle = await MetaTitle.findOneAndUpdate(
        { siteId, url },
        {
          siteId,
          url,
          metaTitleAr,
          metaTitleEn,
          length: metaTitleEn.length,
        },
        { upsert: true, new: true },
      );

      return res.status(200).json(metaTitle);
    } catch (error) {
      console.error("Error creating/updating meta title:", error);
      return res
        .status(500)
        .json({ error: "Failed to create/update meta title" });
    }
  }

  // DELETE - Delete a meta title
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Meta title ID is required" });
      }

      await MetaTitle.findByIdAndDelete(id);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting meta title:", error);
      return res.status(500).json({ error: "Failed to delete meta title" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
