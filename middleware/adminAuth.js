import jwt from "jsonwebtoken";

export default function adminAuth(req, res, next) {
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.isAdmin) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}
