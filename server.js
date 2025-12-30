import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import premiumAccountRoutes from "./routes/premiumAccountRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* 🔐 REQUIRED FOR RENDER + SECURE COOKIES */
app.set("trust proxy", 1);

/* ===============================
   CORS (PRODUCTION SAFE)
================================ */
const allowedOrigins = [
  "https://magicworldofficial.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===============================
   MIDDLEWARE
================================ */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   STATIC FILES
================================ */
app.use("/uploads", express.static("uploads"));

/* ===============================
   ROUTES
================================ */
app.use("/admin", adminRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/premium-accounts", premiumAccountRoutes);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("MagicWorld backend is running");
});

/* ===============================
   ERROR HANDLER (CORS SAFE)
================================ */
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
