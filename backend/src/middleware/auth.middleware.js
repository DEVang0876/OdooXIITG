import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Authentication middleware
export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.authToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user account is inactive.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Manager authorization (can access own and subordinates' data)
export const managerAuth = async (req, res, next) => {
  try {
    const { user } = req;
    const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
    
    // Admin can access everything
    if (user.role === 'admin') {
      return next();
    }
    
    // User can access only their own data
    if (user.role === 'user') {
      if (resourceUserId && resourceUserId !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own data.'
        });
      }
      return next();
    }
    
    // Manager can access their own data and subordinates' data
    if (user.role === 'manager') {
      if (!resourceUserId || resourceUserId === user._id.toString()) {
        return next();
      }
      
      const targetUser = await User.findById(resourceUserId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }
      
      if (targetUser.manager && targetUser.manager.toString() === user._id.toString()) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your subordinates\' data.'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization check failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.authToken;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user owns the resource
export const ownershipCheck = (resourcePath = 'user') => {
  return (req, res, next) => {
    const resourceUserId = req.params.userId || 
                          req.body[resourcePath] || 
                          req.query.userId;
    
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (resourceUserId && resourceUserId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

// Require email verification middleware
export const requireEmailVerification = async (req, res, next) => {
  try {
    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required. Please verify your email to access this resource.',
        requiresEmailVerification: true,
        userEmail: req.user.email
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking email verification status'
    });
  }
};