import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Sending to Gemini:", message); // Debug log

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: message }],
        }],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      }
    );

    console.log("Gemini response:", response.data); // Debug log

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Unexpected response format from Gemini");
    }

    res.json({ 
      reply: response.data.candidates[0].content.parts[0].text 
    });

  } catch (error) {
    console.error("Chat error:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    res.status(500).json({
      error: "Chat service unavailable",
      details: process.env.NODE_ENV === "development" ? {
        message: error.message,
        apiResponse: error.response?.data
      } : undefined,
    });
  }
});

export default router;