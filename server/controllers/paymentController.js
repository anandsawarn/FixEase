// controllers/paymentController.js
import crypto from "crypto";
import { instance } from "../index.js"; 

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log("Creating order for amount:", amount); // Debug log
    
    const options = {
      amount: Number(amount) * 100, // Ensure amount is a number
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    
    const order = await instance.orders.create(options);
    console.log("Order created:", order); // Debug log
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating order",
      error: error.message 
    });
  }
};

export const getKey = async (req, res) => {
  try {
    console.log("Fetching Razorpay key"); // Debug log
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_API_KEY
    });
  } catch (error) {
    console.error("Get key error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Razorpay key"
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    console.log("Verifying payment for booking:", bookingId); // Debug log

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Here you should update your booking status in database
      console.log("Payment verified successfully for booking:", bookingId);
      
      res.status(200).json({ 
        success: true,
        message: "Payment verified successfully" 
      });
    } else {
      console.log("Invalid signature received");
      res.status(400).json({ 
        success: false,
        message: "Invalid signature" 
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during payment verification",
      error: error.message
    });
  }
};