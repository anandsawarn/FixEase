// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { EventEmitter } from "events";
import Razorpay from "razorpay";

// Load environment variables
dotenv.config();

// Local imports
import connectDB from "./config/db.js";
import AdminAuthRoute from "./routes/AdminAuthRoute.js";
import BookServiceRoute from "./routes/BookServiceRoute.js";
import EmployeeRoutes from "./routes/EmployeeRoutes.js";
import TestimonialRoutes from "./routes/TestimonialRoutes.js";
import UserQueryRoutes from "./routes/UserQueryRoutes.js";
import ServiceRoutes from "./routes/ServiceRoutes.js";
import UserRoute from "./routes/UserRoute.js";
import ChatRoute from "./routes/ChatRoute.js";
import paymentRoute from "./routes/paymentRoute.js";

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Increase default event listener limit
EventEmitter.defaultMaxListeners = 15;

// Initialize Express app
const app = express();

// Razorpay instance
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Connect to DB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, process.env.ADMIN_URL]
    : "https://fixease.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsers with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later.",
});
app.use("/api/", apiLimiter);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many chat requests, slow down.",
});

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
  setHeaders: res => {
    res.set('Cache-Control', 'public, max-age=604800');
  }
}));

// API Routes
app.use("/api/admin", AdminAuthRoute);
app.use("/api/employees", EmployeeRoutes);
app.use("/api/testimonials", TestimonialRoutes);
app.use("/api/user-queries", UserQueryRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api", BookServiceRoute);
app.use("/api/users", UserRoute);
app.use("/api/chat", chatLimiter, ChatRoute);
app.use("/api/v1", paymentRoute);

// Serve client build in production
const clientPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-store');
    }
  }
}));

// Handle SPA routing
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(clientPath, "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`➡️ Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => process.exit(1));
});
