import express from "express";
import {
  createQuery,
  getAllQueries,
  updateQueryStatus,
} from "../controllers/userQueryController.js";
import {
  queryValidation,
  statusValidation,
} from "../middlewares/userQueryValidation.js";

const router = express.Router();

// Middleware for validation
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Routes
router.post("/submit-query", validate(queryValidation), createQuery);
router.get("/get-all-queries", getAllQueries);
router.patch(
  "/update-query/:id/status", // Changed to match your frontend
  validate(statusValidation),
  updateQueryStatus
);

export default router;