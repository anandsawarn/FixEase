// middlewares/BookServiceValidation.js
import Joi from "joi";
import mongoose from "mongoose";

// Custom validator to check valid ObjectId
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const bookingSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits",
    }),
  address: Joi.string().trim().min(10).required(),
  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Pincode must be a 6-digit number not starting with 0",
    }),
  additionalMessage: Joi.string().max(500).allow("", null),
  serviceIds: Joi.array()
    .items(Joi.string().custom(isValidObjectId, "ObjectId validation"))
    .min(1)
    .required()
    .messages({ "array.min": "At least one service must be selected" }),
});

const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "completed", "cancelled")
    .required(),
});

export const validateBooking = (req, res, next) => {
  const { error } = bookingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.reduce((acc, curr) => {
      acc[curr.path[0]] = curr.message;
      return acc;
    }, {});
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { error } = statusUpdateSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errors = error.details.reduce((acc, curr) => {
      acc[curr.path[0]] = curr.message;
      return acc;
    }, {});
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  next();
};
