import express from 'express';
import { 
  register, 
  login, 
  logout, 
  logoutAll, 
  refresh, 
  getMe, 
  updateProfile, 
  changePassword,
  verifyEmail,
  resendOTP
} from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { 
  validate, 
  registerValidation, 
  loginValidation, 
  updateProfileValidation, 
  changePasswordValidation,
  emailVerificationValidation,
  resendOTPValidation
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh', refresh);
router.post('/verify-email', validate(emailVerificationValidation), verifyEmail);
router.post('/resend-otp', validate(resendOTPValidation), resendOTP);

// Protected routes
router.use(auth); // All routes below require authentication

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.put('/profile', validate(updateProfileValidation), updateProfile);
router.put('/change-password', validate(changePasswordValidation), changePassword);

export default router;