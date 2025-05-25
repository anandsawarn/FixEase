// models/BookServiceModel.js
import mongoose from "mongoose";

const BookServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    additionalMessage: { type: String, trim: true },
    serviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending","completed", "cancelled"],
      default: "pending",
    },
    statusChangedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
BookServiceSchema.index({ email: 1 });
BookServiceSchema.index({ serviceIds: 1 });
BookServiceSchema.index({ status: 1 });

const BookService = mongoose.model("BookService", BookServiceSchema);
export default BookService;
