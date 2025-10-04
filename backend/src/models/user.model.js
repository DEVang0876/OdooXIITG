import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String,
    default: null
  },
  emailVerificationOTPExpires: {
    type: Date,
    default: null
  },
  emailVerificationAttempts: {
    type: Number,
    default: 0
  },
  lastOTPSent: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for subordinates (if user is a manager)
userSchema.virtual('subordinates', {
  ref: 'User',
  localField: '_id',
  foreignField: 'manager'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// Method to add refresh token
userSchema.methods.addRefreshToken = async function (token) {
  this.refreshTokens.push({ token });

  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  await this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter(
    tokenObj => tokenObj.token !== token
  );
  await this.save();
};

// Method to clear all refresh tokens
userSchema.methods.clearRefreshTokens = async function () {
  this.refreshTokens = [];
  await this.save();
};

// Method to generate email verification OTP
userSchema.methods.generateEmailVerificationOTP = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP and expiration (10 minutes from now)
  this.emailVerificationOTP = otp;
  this.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.lastOTPSent = new Date();

  return otp;
};

// Method to verify email OTP
userSchema.methods.verifyEmailOTP = function (providedOTP) {
  // Check if OTP exists and hasn't expired
  if (!this.emailVerificationOTP || !this.emailVerificationOTPExpires) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }

  if (new Date() > this.emailVerificationOTPExpires) {
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (this.emailVerificationOTP !== providedOTP) {
    this.emailVerificationAttempts += 1;

    // Lock account after 5 failed attempts
    if (this.emailVerificationAttempts >= 5) {
      this.emailVerificationOTP = null;
      this.emailVerificationOTPExpires = null;
      return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    return { success: false, message: 'Invalid OTP. Please try again.' };
  }

  // OTP is valid - verify the email
  this.isEmailVerified = true;
  this.emailVerificationOTP = null;
  this.emailVerificationOTPExpires = null;
  this.emailVerificationAttempts = 0;

  return { success: true, message: 'Email verified successfully!' };
};

// Method to check if can send OTP (rate limiting)
userSchema.methods.canSendOTP = function () {
  if (!this.lastOTPSent) return true;

  const timeSinceLastOTP = Date.now() - this.lastOTPSent.getTime();
  const cooldownPeriod = 60 * 1000; // 1 minute cooldown

  return timeSinceLastOTP > cooldownPeriod;
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email, isActive: true }).select('+password');

  if (!user) {
    throw new Error('Invalid login credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }

  return user;
};

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ manager: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;