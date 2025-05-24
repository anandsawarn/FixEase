import Joi from "joi";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Validation Schemas
const signupSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

// Middlewares
export const validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details.map((e) => e.message).join(", "),
    });
  next();
};

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details.map((e) => e.message).join(", "),
    });
  next();
};

export const validateForgetPassword = (req, res, next) => {
  const { error } = forgetPasswordSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details.map((e) => e.message).join(", "),
    });
  next();
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });

    req.user = user;
    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res
      .status(401)
      .json({ success: false, message: `Unauthorized - ${msg}` });
  }
};
