import Product from "../models/Product.js";

// Sanitize features data to prevent bad input from breaking frontend
function sanitizeFeatures(raw = {}) {
  const clean = {};

  for (const category of Object.keys(raw)) {
    const sections = Array.isArray(raw[category]) ? raw[category] : [];

    clean[category] = sections
      .filter((sec) => sec && typeof sec.title === "string")
      .map((sec) => ({
        title: String(sec.title || "").trim(),
        items: Array.isArray(sec.items)
          ? sec.items.map((item) => String(item || "").trim()).filter(Boolean)
          : [],
      }))
      .filter((sec) => sec.title); // remove empty titles
  }

  return clean;
}

/* 🌍 PUBLIC: Get all products (list view) */
/* Get all products (list view) */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .select("_id name slug desc image prices featuresEnabled statusEnabled statusLabel version size updated category type downloadLink featuresData")
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

/* 🌍 PUBLIC: Get single product by slug (detail page) */
export const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("getProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

/* 🔐 ADMIN: Create new product */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      desc = "",
      image = "",
      version = "",
      size = "",
      updated = "",
      category = "",
      type = "",
      statusEnabled = false,
      statusLabel = "",
      prices = { day: 0, week: 0 },
      downloadLink = "",
      featuresEnabled = false,
      featuresData = {},
    } = req.body;

    // Required fields
    if (!name?.trim() || !slug?.trim() || !image?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, slug, and image URL are required",
      });
    }

    const newProduct = new Product({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      desc: desc.trim(),
      image: image.trim(),
      version: version.trim(),
      size: size.trim(),
      updated: updated.trim(),
      category: category.trim(),
      type: type.trim(),
      statusEnabled: Boolean(statusEnabled),
      statusLabel: statusLabel.trim(),
      prices: {
        day: Number(prices.day) || 0,
        week: Number(prices.week) || 0,
      },
      downloadLink: downloadLink.trim(),
      featuresEnabled: Boolean(featuresEnabled),
      featuresData: sanitizeFeatures(featuresData),
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("createProduct error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists. Choose a different slug.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

/* 🔐 ADMIN: Update product by id */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      slug,
      desc,
      image,
      version,
      size,
      updated,
      category,
      type,
      statusEnabled,
      statusLabel,
      prices,
      downloadLink,
      featuresEnabled,
      featuresData,
    } = req.body;

    const updateData = {};

    if (name?.trim()) updateData.name = name.trim();
    if (slug?.trim()) updateData.slug = slug.trim().toLowerCase();
    if (desc !== undefined) updateData.desc = (desc || "").trim();
    if (image !== undefined) updateData.image = (image || "").trim();
    if (version !== undefined) updateData.version = (version || "").trim();
    if (size !== undefined) updateData.size = (size || "").trim();
    if (updated !== undefined) updateData.updated = (updated || "").trim();
    if (category !== undefined) updateData.category = (category || "").trim();
    if (type !== undefined) updateData.type = (type || "").trim();
    if (statusEnabled !== undefined) updateData.statusEnabled = Boolean(statusEnabled);
    if (statusLabel !== undefined) updateData.statusLabel = (statusLabel || "").trim();
    if (prices !== undefined) {
      updateData.prices = {
        day: Number(prices.day) || 0,
        week: Number(prices.week) || 0,
      };
    }
    if (downloadLink !== undefined) updateData.downloadLink = (downloadLink || "").trim();
    if (featuresEnabled !== undefined) updateData.featuresEnabled = Boolean(featuresEnabled);
    if (featuresData !== undefined) updateData.featuresData = sanitizeFeatures(featuresData);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("updateProduct error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This slug is already in use",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

/* 🔐 ADMIN: Delete product by id */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};