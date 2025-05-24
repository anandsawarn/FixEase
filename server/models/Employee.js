import mongoose from "mongoose";

// Sub-schema for payment history
const paymentHistorySchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  timestamp: { type: Date, required: true },
  monthYear: { type: String, required: true },
  amount: { type: Number, required: true },
});

// Main employee schema
const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  aadhaar: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  // Optional/editable fields (not required at creation)
  address: {
    type: String,
    default: "",
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  salaryStatus: {
    type: String,
    enum: ["paid", "partially_paid", "unpaid"],
    default: "paid",
  },
  lastPayment: {
    type: Date,
    default: null,
  },
  paymentHistory: {
    type: [paymentHistorySchema],
    default: [],
  },
});

const Employee = mongoose.model("Employee", employeeSchema, "Employee");

export default Employee;
