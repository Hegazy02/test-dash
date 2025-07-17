import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const Users = await User.find({});
    res.status(200).json(Users);
  } catch (error) {
    console.error("Error fetching Users:", error);
    res.status(500).json({ message: "Error fetching Users" });
  }
}
