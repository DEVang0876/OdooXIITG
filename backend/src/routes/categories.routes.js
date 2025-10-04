import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} from '../controllers/category.controller.js';
import { auth, authorize, requireEmailVerification } from '../middleware/auth.middleware.js';
import { validate, categoryValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication and email verification
router.use(auth);
router.use(requireEmailVerification);

// Public category routes (all authenticated users)
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/stats', getCategoryStats);

// Admin/Manager only routes
router.post('/', authorize('admin', 'manager'), validate(categoryValidation), createCategory);
router.put('/:id', authorize('admin', 'manager'), validate(categoryValidation), updateCategory);

// Admin only routes
router.delete('/:id', authorize('admin'), deleteCategory);

export default router;