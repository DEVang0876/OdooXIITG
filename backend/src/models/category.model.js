import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#007bff',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon name cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    monthly: {
      type: Number,
      min: 0,
      default: 0
    },
    yearly: {
      type: Number,
      min: 0,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total expenses in this category
categorySchema.virtual('totalExpenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual for total amount spent in this category
categorySchema.virtual('totalAmount', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'category'
});

// Index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ createdBy: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;