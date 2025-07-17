import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import { authenticateToken } from "../authMiddleware";

export default async function handler(req, res) {
  await dbConnect();

  authenticateToken(req, res, async () => {
    if (req.method === "POST") {
      try {
        const { email, updateFields } = req.body;
        const updatedUser = await User.findOneAndUpdate(
          { email },
          { $set: updateFields },
          { new: true, upsert: true },
        );
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ error: "Error updating user data  " + error });
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}
