import mongoose from "mongoose";
import PremiumAccount from "../models/PremiumAccount.js";

/* 🌍 Public: Get all accounts */
export const getAccounts = async (req, res) => {
  try {
    const accounts = await PremiumAccount.find().select(
      "title slug desc img badges price isAvailable"
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
      "title slug desc img badges gallery price isAvailable"
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

/* 🔐 Admin: Get account by ID */
export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid account ID" });
    }

    const account = await PremiumAccount.findById(id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ success: true, account });
  } catch {
    res.status(500).json({ error: "Server error" });
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
    } = req.body;

    // Required fields check
    if (!title || !img || !desc || !slug) {
      return res.status(400).json({
        success: false,
        message: "Title, image, description, and slug are required",
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
        message: "This slug already exists. Try a different title.",
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
    };

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

/* 🔐 Admin: Delete account */
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid account ID" });
    }

    const account = await PremiumAccount.findByIdAndDelete(id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ success: true, message: "Account deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};