import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
  getUserExpenseSummary
} from '../controllers/user.controller.js';
import { auth, authorize, requireEmailVerification } from '../middleware/auth.middleware.js';
import { validate, registerValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication and email verification
router.use(auth);
router.use(requireEmailVerification);

// Routes accessible by admin and managers
router.get('/', authorize('admin', 'manager'), getUsers);
router.get('/:id', getUser); // Access control handled in controller
router.get('/:id/expenses/summary', getUserExpenseSummary); // Access control handled in controller

// Admin only routes
router.post('/', authorize('admin'), validate(registerValidation), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deactivateUser);

export default router;