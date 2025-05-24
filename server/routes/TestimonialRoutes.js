// routes/testimonialRoutes.js
import express from "express";
import {
  createTestimonial,
  getTestimonials,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.post("/", createTestimonial); // POST /api/testimonials
router.get("/", getTestimonials); // GET /api/testimonials

export default router;