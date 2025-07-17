import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import { authenticateToken } from "../authMiddleware";

export default async function handler(req, res) {
  await dbConnect();

  authenticateToken(req, res, async () => {
    if (req.method === "POST") {
      try {
        const { id } = req.body;
        if (id === "676aaa4e75061efd02136a0f") {
          res.status(405).json({ error: "you can't delete this user" });
          return;
        }
        const deletedUser = await User.findOneAndDelete({ _id: id });

        if (deletedUser) {
          res.status(200).json({ message: "User deleted successfully" });
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ error: "Error deleting user data: " + error.message });
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}
