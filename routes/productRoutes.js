import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/productController.js";

import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* 🌍 PUBLIC ROUTES - Use slug (user-friendly) */
router.get("/", getProducts);                    // Get all products
router.get("/:slug", getProduct);                // Get single product by slug

/* 🔐 ADMIN ROUTES - Use _id (secure & reliable) */
router.post("/", adminAuth, createProduct);      // Create new product
router.put("/:id", adminAuth, updateProduct);    // ← Changed to :id
router.delete("/:id", adminAuth, deleteProduct); // ← Changed to :id

export default router;