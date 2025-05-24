import mongoose from "mongoose";

const userQuerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    query: {
      type: String,
      required: [true, "Query is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"], // Simplified to only these two statuses
      default: "pending",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    attended: {
      // Add this field to match your frontend
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

const UserQueryModel = mongoose.model("UserQuery", userQuerySchema);
export default UserQueryModel;