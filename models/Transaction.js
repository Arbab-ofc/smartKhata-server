import mongoose from 'mongoose';
import validator from 'validator';
import User from './User.js';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      enum: {
        values: [
          'salary',
          'freelance',
          'investment',
          'rent',
          'food',
          'groceries',
          'transport',
          'entertainment',
          'shopping',
          'utilities',
          'education',
          'healthcare',
          'others',
        ],
        message: 'Invalid category',
      },
      required: [true, 'Category is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [100, 'Note cannot exceed 100 characters'],
    },
    paymentMode: {
      type: String,
      enum: {
        values: ['cash', 'upi', 'card', 'bank', 'other'],
        message: 'Invalid payment mode',
      },
      default: 'cash',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
