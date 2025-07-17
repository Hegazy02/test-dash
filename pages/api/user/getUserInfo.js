import { authenticateToken } from "../authMiddleware";

export default function handler(req, res) {
  authenticateToken(req, res, () => {
    console.log("User authenticated:", req.user);
    if (req.user && req.user.email) {
      return res.status(200).json({
        email: req.user.email,
        username: req.user.username,
        id: req.user.id,
        role: req.user.role,
      });
    } else {
      return res
        .status(401)
        .json({ message: "User not authenticated or email not found" });
    }
  });
}
