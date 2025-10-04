import express from 'express';
import {
  getDashboardAnalytics,
  getExpenseReports,
  getExpenseTrends
} from '../controllers/analytics.controller.js';
import { auth, requireEmailVerification } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and email verification
router.use(auth);
router.use(requireEmailVerification);

// Analytics routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/reports', getExpenseReports);
router.get('/trends', getExpenseTrends);

export default router;