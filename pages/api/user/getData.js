import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import { authenticateToken } from "../authMiddleware";

export default async function handler(req, res) {
  authenticateToken(req, res, async () => {
    if (req.method === "GET") {
      await dbConnect();
      try {
        let user;
        const { email, CustomerId } = req.query;
        if (email) {
          user = await User.findOne({ email });
        } else if (CustomerId) {
          user = await User.findOne({ "Orders.CustomerId": CustomerId });
        }

        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Error fetching user data " + error });
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  });
}
