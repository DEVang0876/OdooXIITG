import express from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense
} from '../controllers/expense.controller.js';
import { auth, authorize, requireEmailVerification } from '../middleware/auth.middleware.js';
import { validate, expenseValidation } from '../middleware/validation.middleware.js';
import { uploadReceipts, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication and email verification
router.use(auth);
router.use(requireEmailVerification);

// Expense routes
router.get('/', getExpenses);
router.get('/:id', getExpense);

router.post('/', 
  uploadReceipts, 
  handleUploadError, 
  validate(expenseValidation), 
  createExpense
);

router.put('/:id', 
  uploadReceipts, 
  handleUploadError, 
  validate(expenseValidation), 
  updateExpense
);

router.delete('/:id', deleteExpense);

// Approval routes (Manager/Admin only)
router.put('/:id/approve', authorize('manager', 'admin'), approveExpense);
router.put('/:id/reject', authorize('manager', 'admin'), rejectExpense);

export default router;