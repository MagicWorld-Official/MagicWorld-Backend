import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ================================
   SESSION CHECK
================================ */
router.get("/me", adminAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

/* ================================
   LOGIN (NO COOKIE)
================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false });
    }

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔐 Return token instead of cookie
    res.json({
      success: true,
      token,
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ================================
   LOGOUT (CLIENT SIDE ONLY)
================================ */
router.post("/logout", (req, res) => {
  // Nothing to do server-side anymore
  res.json({ success: true });
});

export default router;
