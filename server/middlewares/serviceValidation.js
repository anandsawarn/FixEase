import Joi from "joi";
import mongoose from "mongoose";

// Validation schema (without image)
export const serviceSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(),
});

// Validation schema for updates (fields are optional)
export const updateServiceSchema = Joi.object({
  title: Joi.string().min(3),
  description: Joi.string().min(10),
  price: Joi.number().min(0),
  category: Joi.string(),
});

// Middleware to validate service creation
export const validateService = (req, res, next) => {
  const serviceData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
  };

  const { error } = serviceSchema.validate(serviceData);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Middleware to validate service update (allows optional fields)
export const validateServiceUpdate = (req, res, next) => {
  const serviceData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
  };

  const { error } = updateServiceSchema.validate(serviceData);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Middleware to validate service ID for delete and get by ID
export const validateServiceId = (req, res, next) => {
  const { id } = req.params;

  // Check if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid service ID format" });
  }
  next();
};