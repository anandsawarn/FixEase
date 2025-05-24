import mongoose from "mongoose";


const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
// Collection name is explicitly "Admin"
const Admin = mongoose.model("Admin", adminSchema, "Admin");
export default Admin;
