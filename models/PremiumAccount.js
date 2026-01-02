// models/PremiumAccount.js
import mongoose from "mongoose";

const premiumAccountSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    badges: {
      type: [String],
      default: [],
    },

    img: {
      type: String,
      required: true,
      trim: true,
    },

    gallery: {
      type: [String],
      default: [],
    },

    desc: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    // NEW: Account type for filtering
    type: {
      type: String,
      enum: ["Social", "Game"],
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

premiumAccountSchema.index({ slug: 1 }, { unique: true });
// Optional: index for faster searches
premiumAccountSchema.index({ title: "text", desc: "text" });

export default mongoose.model("PremiumAccount", premiumAccountSchema);