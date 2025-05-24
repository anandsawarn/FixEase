import express from "express";
import multer from "multer";
import {
  createService,
  getAllServices,
  getServicesByCategory,
  deleteService, // Import deleteService function
  updateService, // Import updateService function (if needed)
} from "../controllers/serviceController.js";
import {
  validateService,
  validateServiceUpdate,
  validateServiceId,
} from "../middlewares/serviceValidation.js";

const router = express.Router();

// Configure file storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Save in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Routes
// Create a new service
router.post("/", upload.single("image"), validateService, createService); // Create service

// Get all services
router.get("/", getAllServices); // Get all services

// Get services by category
router.get("/category/:category", getServicesByCategory); // Get services by category


// Update service by ID
router.put(
  "/:id",
  validateServiceId,
  upload.single("image"),
  validateServiceUpdate,
  updateService
); // Update service by ID

// Delete service by ID
router.delete("/:id", validateServiceId, deleteService); // Delete service by ID route

export default router;