import Joi from 'joi';

// User registration validation
export const registerValidation = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  
  role: Joi.string()
    .valid('user', 'manager', 'admin')
    .default('user'),
  
  department: Joi.string()
    .max(100)
    .allow(''),
  
  employeeId: Joi.string()
    .max(50)
    .allow('')
});

// User login validation
export const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Password change validation
export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required'
    })
});

// Profile update validation
export const updateProfileValidation = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  
  department: Joi.string()
    .max(100)
    .allow(''),
  
  employeeId: Joi.string()
    .max(50)
    .allow('')
});

// Expense validation
export const expenseValidation = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .max(1000)
    .allow(''),
  
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
  
  currency: Joi.string()
    .valid('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY')
    .default('USD'),
  
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Category must be a valid ID',
      'any.required': 'Category is required'
    }),
  
  date: Joi.date()
    .max('now')
    .default(Date.now),
  
  paymentMethod: Joi.string()
    .valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'digital_wallet', 'other')
    .default('cash'),
  
  vendor: Joi.string()
    .max(200)
    .allow(''),
  
  location: Joi.string()
    .max(200)
    .allow(''),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10),
  
  isBillable: Joi.boolean()
    .default(false),
  
  clientProject: Joi.string()
    .max(200)
    .allow(''),
  
  notes: Joi.string()
    .max(1000)
    .allow('')
});

// Category validation
export const categoryValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 100 characters',
      'any.required': 'Category name is required'
    }),
  
  description: Joi.string()
    .max(500)
    .allow(''),
  
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#007bff')
    .messages({
      'string.pattern.base': 'Please provide a valid hex color'
    }),
  
  icon: Joi.string()
    .max(50)
    .allow(''),
  
  budget: Joi.object({
    monthly: Joi.number().min(0).default(0),
    yearly: Joi.number().min(0).default(0)
  }).default({ monthly: 0, yearly: 0 })
});

// Email verification validation
export const emailVerificationValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required'
    })
});

// Resend OTP validation
export const resendOTPValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    req.body = value;
    next();
  };
};