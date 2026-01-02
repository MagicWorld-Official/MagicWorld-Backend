// controllers/premiumAccountController.js
import mongoose from "mongoose";
import PremiumAccount from "../models/PremiumAccount.js";

/* 🌍 Public: Get all accounts with optional filters */
export const getAccounts = async (req, res) => {
  try {
    const { type, search } = req.query;

    // Build query
    let query = {};

    // Filter by type (Social or Game)
    if (type && ["Social", "Game"].includes(type)) {
      query.type = type;
    }

    // Search in title or description
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const accounts = await PremiumAccount.find(query).select(
      "title slug desc img badges price isAvailable type"
    );

    return res.json(Array.isArray(accounts) ? accounts : []);
  } catch (error) {
    console.error("Get accounts error:", error.message);
    return res.status(500).json([]);
  }
};

/* 🌍 Public: Get single account by slug */
export const getAccountBySlug = async (req, res) => {
  try {
    const account = await PremiumAccount.findOne(
      { slug: req.params.slug },
      "title slug desc img badges gallery price isAvailable type"
    );

    if (!account) {
      return res.status(404).json({ success: false });
    }

    return res.json(account);
  } catch (error) {
    console.error("Get account by slug error:", error.message);
    return res.status(500).json({ success: false });
  }
};

/* 🔐 Admin: Create new account */
export const createAccount = async (req, res) => {
  try {
    const {
      title,
      badges = [],
      img,
      gallery = [],
      desc,
      slug,
      price = 0,
      isAvailable = true,
      type, // NEW required field
    } = req.body;

    // Required fields check
    if (!title || !img || !desc || !slug || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, image, description, slug, and type are required",
      });
    }

    if (!["Social", "Game"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'Social' or 'Game'",
      });
    }

    const newAccount = await PremiumAccount.create({
      title: title.trim(),
      badges: Array.isArray(badges)
        ? badges.map(b => b.trim()).filter(b => b)
        : [],
      img: img.trim(),
      gallery: Array.isArray(gallery)
        ? gallery.map(url => url.trim()).filter(url => url)
        : [],
      desc: desc.trim(),
      slug: slug.trim().toLowerCase(),
      price: Number(price),
      isAvailable,
      type: type.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Premium account created successfully",
      account: newAccount,
    });
  } catch (error) {
    console.error("Create account error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This slug already exists. Try a different one.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create account",
    });
  }
};

/* 🔐 Admin: Update account */
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid account ID" });
    }

    const {
      title,
      badges = [],
      img,
      gallery = [],
      desc,
      slug,
      price = 0,
      isAvailable = true,
      type,
    } = req.body;

    const updatedData = {
      ...(title && { title: title.trim() }),
      badges: Array.isArray(badges)
        ? badges.map(b => b.trim()).filter(b => b)
        : [],
      ...(img && { img: img.trim() }),
      gallery: Array.isArray(gallery)
        ? gallery.map(url => url.trim()).filter(url => url)
        : [],
      ...(desc && { desc: desc.trim() }),
      ...(slug && { slug: slug.trim().toLowerCase() }),
      price: Number(price),
      isAvailable,
      ...(type && { type: type.trim() }),
    };

    // Validate type if provided
    if (type && !["Social", "Game"].includes(type.trim())) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'Social' or 'Game'",
      });
    }

    const account = await PremiumAccount.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({
      success: true,
      message: "Account updated successfully",
      account,
    });
  } catch (error) {
    console.error("Update account error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug already in use by another account",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update account",
    });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const account = await PremiumAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error("Get account by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch account",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const deleted = await PremiumAccount.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    return res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};
