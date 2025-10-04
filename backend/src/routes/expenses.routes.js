import express from 'express';
import axios from 'axios';
import multer from 'multer';
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

// Configure multer for single file upload
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication and email verification
router.use(auth);
router.use(requireEmailVerification);

// New upload route for receipt processing
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Forward the file to OCR service
    const ocrApiUrl = process.env.OCR_API_URL || 'http://localhost:4000';
    const ocrEndpoint = `${ocrApiUrl}/api/v1/ocr/extract-receipt/`;

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const ocrResponse = await axios.post(ocrEndpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Placeholder: Log the extracted text
    console.log('OCR Result:', ocrResponse.data);

    // Placeholder: Mock expense creation
    const mockExpense = {
      id: 'mock-expense-id',
      title: 'Receipt Upload',
      description: ocrResponse.data.text || 'Extracted text from receipt',
      amount: 0, // Would be parsed from OCR
      status: 'pending',
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: mockExpense,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process receipt',
      error: error.message,
    });
  }
});

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