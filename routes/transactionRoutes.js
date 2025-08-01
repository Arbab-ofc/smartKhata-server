import express from "express";
import {
  addTransaction,
  getAllTransactions,
  getRecentTransactions,
  updateTransaction,
  deleteTransaction,
  getStats,
  clearAllTransactions,
  filterTransactions,
} from "../controllers/transactionController.js";

import { protectRoute } from "../middlewares/authMiddleware.js";

const TransactionRouter = express.Router();


TransactionRouter.post("/add", protectRoute, addTransaction);
TransactionRouter.get("/all", protectRoute, getAllTransactions);
TransactionRouter.get("/recent-transaction", protectRoute, getRecentTransactions);
TransactionRouter.put("/update/:id", protectRoute, updateTransaction);
TransactionRouter.delete("/delete/:id", protectRoute, deleteTransaction);
TransactionRouter.get("/stats", protectRoute, getStats);
TransactionRouter.delete("/clear", protectRoute, clearAllTransactions);


TransactionRouter.get("/filter", protectRoute, filterTransactions);

export default TransactionRouter;
