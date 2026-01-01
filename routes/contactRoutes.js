// routes/contactRoutes.js
import express from "express";
import {
  submitContact,
  getContacts,
  markAsRead,
  deleteContact,
} from "../controllers/contactController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Public: Submit message
router.post("/", submitContact);

// Admin routes
router.get("/", adminAuth, getContacts);
router.put("/read/:id", adminAuth, markAsRead);
router.delete("/:id", adminAuth, deleteContact);

export default router;