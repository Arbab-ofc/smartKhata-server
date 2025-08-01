import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail.js';
import { isValidPhoneNumber } from 'libphonenumber-js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [isEmail, 'Invalid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (value) {
          return isValidPhoneNumber(value || '');
        },
        message: 'Invalid phone number format',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: '',
    },
    otpExpiresAt: {
      type: Date,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
