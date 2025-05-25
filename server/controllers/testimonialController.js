// controllers/testimonialController.js
import Testimonial from "../models/Testimonial.js";

// Add a new testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { rating, name, city, message } = req.body;
    const newTestimonial = new Testimonial({ rating, name, city, message });
    await newTestimonial.save();
    res.status(201).json({ success: true, data: newTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};