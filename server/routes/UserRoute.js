import express from "express";
import {
  signup,
  login,
  logout,
  forgetPassword,
  getUserInfo,
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";

import {
  validateSignup,
  validateLogin,
  validateForgetPassword,
  authenticate,
} from "../middlewares/userValidation.js";

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/logout", authenticate, logout);
router.post("/forget-password", validateForgetPassword, forgetPassword);
router.get("/get-user-info", authenticate, getUserInfo);
router.get("/get-all-users", authenticate, getAllUsers);
router.delete("/:id", authenticate, deleteUser);

export default router;
