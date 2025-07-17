import dbConnect from "../../../lib/dbConnect";
import MetaDescription from "../../../models/MetaDescription";

export default async function handler(req, res) {
  await dbConnect();

  const { siteId } = req.query;

  if (!siteId) {
    return res.status(400).json({ error: "Site ID is required" });
  }

  // GET - Fetch all meta descriptions for a site
  if (req.method === "GET") {
    try {
      const metaDescriptions = await MetaDescription.find({ siteId })
        .sort({ updatedAt: -1 })
        .lean();

      return res.status(200).json(metaDescriptions);
    } catch (error) {
      console.error("Error fetching meta descriptions:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch meta descriptions" });
    }
  }

  // POST - Create or update a meta description
  if (req.method === "POST") {
    try {
      const { url, metaDescriptionAr, metaDescriptionEn } = req.body;

      if (!url || !metaDescriptionAr || !metaDescriptionEn) {
        return res.status(400).json({
          error:
            "URL, Arabic description, and English description are required",
        });
      }

      const metaDescription = await MetaDescription.findOneAndUpdate(
        { siteId, url },
        {
          siteId,
          url,
          metaDescriptionAr,
          metaDescriptionEn,
          length: metaDescriptionEn.length,
        },
        { upsert: true, new: true },
      );

      return res.status(200).json(metaDescription);
    } catch (error) {
      console.error("Error creating/updating meta description:", error);
      return res
        .status(500)
        .json({ error: "Failed to create/update meta description" });
    }
  }

  // DELETE - Delete a meta description
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res
          .status(400)
          .json({ error: "Meta description ID is required" });
      }

      await MetaDescription.findByIdAndDelete(id);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting meta description:", error);
      return res
        .status(500)
        .json({ error: "Failed to delete meta description" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
