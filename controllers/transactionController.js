import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const addTransaction = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      type,
      amount,
      category,
      note,
      paymentMode,
      date,
    } = req.body;

    // Basic validation
    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Type, amount, and category are required.' });
    }

    // Optional: Check if user exists and is verified
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return res.status(401).json({ message: 'Unauthorized or unverified user.' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      type,
      amount,
      category,
      note,
      paymentMode,
      date,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction,
    });

  } catch (error) {
    console.error('Error in addTransaction:', error);
    res.status(500).json({ message: 'Server Error. Failed to add transaction.' });
  }
};

export const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing from the request.' });
    }

    const recentTxns = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      message: 'Recent transactions fetched successfully.',
      transactions: recentTxns,
    });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recent transactions.',
    });
  }
};



export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'All transactions fetched successfully',
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Error in getAllTransactions:', error);
    res.status(500).json({ message: 'Server Error. Failed to fetch transactions.' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const {
      type,
      amount,
      category,
      note,
      paymentMode,
      date,
    } = req.body;

    // Find the transaction
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    // Update fields
    if (type) transaction.type = type;
    if (amount) transaction.amount = amount;
    if (category) transaction.category = category;
    if (note !== undefined) transaction.note = note;
    if (paymentMode) transaction.paymentMode = paymentMode;
    if (date) transaction.date = date;

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction,
    });

  } catch (error) {
    console.error('Error in updateTransaction:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
};


export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      user: userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });

  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    res.status(500).json({ message: 'Server error while deleting transaction' });
  }
};


export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all transactions of the user
    const transactions = await Transaction.find({ user: userId });

    let income = 0;
    let expense = 0;
    const categoryBreakdown = {};

    for (let tx of transactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else if (tx.type === 'expense') {
        expense += tx.amount;
      }

      // Category-wise aggregation
      if (!categoryBreakdown[tx.category]) {
        categoryBreakdown[tx.category] = tx.amount;
      } else {
        categoryBreakdown[tx.category] += tx.amount;
      }
    }

    const balance = income - expense;

    return res.status(200).json({
      success: true,
      stats: {
        income,
        expense,
        balance,
        categoryBreakdown,
      },
    });

  } catch (error) {
    console.error('Error in getStats:', error);
    return res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

export const clearAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Transaction.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: 'All transactions deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error in clearAllTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all transactions',
    });
  }
};


export const filterTransactions = async (req, res) => {
try {
const userId = req.user.id;
const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

const filter = { user: userId };

if (type) {
filter.type = type; // 'income' or 'expense'
}

if (category) {
filter.category = category;
}

if (startDate && endDate) {
filter.date = {
$gte: new Date(startDate),
$lte: new Date(endDate),
};
}

const skip = (page - 1) * limit;

const transactions = await Transaction.find(filter)
.sort({ date: -1 })
.skip(skip)
.limit(Number(limit));

const total = await Transaction.countDocuments(filter);

res.status(200).json({
success: true,
data: transactions,
total,
page: Number(page),
pages: Math.ceil(total / limit),
});
} catch (error) {
console.error('Error filtering transactions:', error);
res.status(500).json({
success: false,
message: 'Failed to filter transactions',
});
}
};

