import jwt from "jsonwebtoken";

export default function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
