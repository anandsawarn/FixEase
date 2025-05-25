// routes/BookServiceRoute.js
import express from "express";
import {
  createBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
} from "../controllers/BookServiceController.js";

const router = express.Router();

// POST: Create a new booking
router.post("/book-service", createBooking);

// GET: Retrieve all bookings (with optional filters)
router.get("/bookings", getAllBookings);

// PUT: Update a booking's status
router.patch("/booking/:id", updateBooking);

// DELETE: Delete a booking
router.delete("/booking/:id", deleteBooking);

export default router;
