import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(409).json({
        message: "User already exists, you can login",
        success: false,
      });
    }

    const newAdmin = new Admin({ name, email, password });
    newAdmin.password = await bcrypt.hash(password, 10);
    await newAdmin.save();

    res.status(201).json({
      message: "Signup successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    const errorMsg = "Wrong email or password";

    if (!admin) {
      return res.status(403).json({
        message: errorMsg,
        success: false,
      });
    }

    const isPasswordEqual = await bcrypt.compare(password, admin.password);

    if (!isPasswordEqual) {
      return res.status(403).json({
        message: errorMsg,
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      { email: admin.email, _id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successfully",
      success: true,
      jwtToken,
      email,
      name: admin.name,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export { signup, login };
