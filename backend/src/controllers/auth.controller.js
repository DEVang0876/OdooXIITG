import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import emailService from '../utils/emailService.js';

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, employeeId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employee ID already exists
    if (employeeId) {
      const existingEmployee = await User.findOne({ employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Create user (email not verified initially)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      department,
      employeeId,
      isEmailVerified: false
    });

    // Generate OTP
    const otp = user.generateEmailVerificationOTP();
    await user.save();

    // Send verification email
    try {
      await emailService.sendOTPEmail(email, otp, `${firstName} ${lastName}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Still allow registration to complete, user can request new OTP
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        },
        requiresEmailVerification: true,
        message: 'Please verify your email before logging in'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresEmailVerification: true,
        userId: user._id
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    await user.addRefreshToken(refreshToken);

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res.cookie('authToken', authToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token: authToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await req.user.removeRefreshToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAll = async (req, res) => {
  try {
    await req.user.clearRefreshTokens();

    // Clear cookies
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(
      tokenObj => tokenObj.token === refreshToken
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAuthToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res.cookie('authToken', newAuthToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newAuthToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('manager', 'firstName lastName email role')
      .populate('subordinates', 'firstName lastName email role department');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
          manager: user.manager,
          subordinates: user.subordinates,
          avatar: user.avatar,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'department', 'employeeId'];
    const updates = {};

    // Only include allowed fields
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Check if employee ID already exists (if being updated)
    if (updates.employeeId && updates.employeeId !== req.user.employeeId) {
      const existingEmployee = await User.findOne({
        employeeId: updates.employeeId,
        _id: { $ne: req.user._id }
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens to force re-login on all devices
    await user.clearRefreshTokens();

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password change failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Verify OTP
    const isValid = user.verifyEmailOTP(otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    user.emailVerificationAttempts = 0;
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Resend verification OTP
// @route   POST /auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if user can send OTP (rate limiting)
    const canSend = user.canSendOTP();
    if (!canSend.allowed) {
      return res.status(429).json({
        success: false,
        message: canSend.message,
        retryAfter: canSend.retryAfter
      });
    }

    // Generate new OTP
    const otp = user.generateEmailVerificationOTP();
    await user.save();

    // Send OTP email
    try {
      await emailService.sendOTPEmail(email, otp, user.fullName);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully. Please check your email.',
      data: {
        email: user.email,
        retryAfter: 60 // seconds before next OTP can be sent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};