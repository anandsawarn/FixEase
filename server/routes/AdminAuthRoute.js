import express from "express";
import { login, signup } from "../controllers/AdminAuthController.js";
import  {
  loginValidation,
  signupValidation,
} from "../middlewares/AdminAuthValidation.js";

const router = express.Router(); 
router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
export default router;
