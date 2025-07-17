import dbConnect from "../../../lib/dbConnect";
import Shortcut from "../../../models/shortcut";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "GET") {
    const { name, inc } = req.query;
    if (name) {
      try {
        let shortcut;
        if (inc === "1") {
          shortcut = await Shortcut.findOneAndUpdate(
            { name },
            { $inc: { counter: 1 } },
            { new: true }
          );
        } else {
          shortcut = await Shortcut.findOne({ name });
        }
        if (shortcut) {
          return res.status(200).json(shortcut);
        } else {
          return res.status(404).json({ error: "Link not found" });
        }
      } catch (error) {
        return res.status(500).json({ error: "Error finding link" });
      }
    } else {
      try {
        const data = await Shortcut.find({});
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: "Error fetching shortcuts" });
      }
    }
  } else if (req.method === "POST") {
    try {
      // Check for unique name
      const exists = await Shortcut.findOne({ name: req.body.name });
      if (exists) {
        return res.status(409).json({ error: "Name already exists" });
      }
      const newShortcut = await Shortcut.create(req.body);
      return res.status(201).json(newShortcut);
    } catch (error) {
      return res.status(400).json({ error: "Error creating shortcut" });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Shortcut ID is required" });
    }
    try {
      await Shortcut.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Error deleting shortcut" });
    }
  } else if (req.method === "PUT") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Shortcut ID is required" });
    }
    try {
      // Check for unique name (exclude current id)
      if (req.body.name) {
        const exists = await Shortcut.findOne({
          name: req.body.name,
          _id: { $ne: id },
        });
        if (exists) {
          return res.status(409).json({ error: "Name already exists" });
        }
      }
      const updated = await Shortcut.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true },
      );
      if (!updated) {
        return res.status(404).json({ error: "Shortcut not found" });
      }
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Error updating shortcut" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
