import mongoose from "mongoose";
import validator from "validator";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      maxlength: [100, "Subject can't be more than 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [10, "Message should be at least 10 characters"],
      maxlength: [1000, "Message can't exceed 1000 characters"],
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
