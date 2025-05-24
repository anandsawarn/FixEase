// routes/paymentRoute.js
import express from "express";
import {
  createOrder,getKey,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", createOrder);
router.get("/getKey", getKey);
// Verify Razorpay payment
router.post("/verify", verifyPayment);

export default router;
