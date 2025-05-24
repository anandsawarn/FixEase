import Joi from "joi";

export const queryValidation = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
  }),
  phoneNumber: Joi.string().trim().required().messages({
    "string.empty": "Phone number is required",
  }),
  query: Joi.string().trim().required().messages({
    "string.empty": "Query is required",
  }),
});

export const statusValidation = Joi.object({
  status: Joi.string().valid("pending", "resolved").required(), // Only these two statuses
});