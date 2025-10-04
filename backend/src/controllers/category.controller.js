import Category from '../models/category.model.js';
import Expense from '../models/expense.model.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const categories = await Category.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('createdBy', 'firstName lastName email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin/Manager)
export const createCategory = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      createdBy: req.user._id
    };

    const category = new Category(categoryData);
    await category.save();

    await category.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Manager)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete category (soft delete)
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  try {
    // Check if category has associated expenses
    const expenseCount = await Expense.countDocuments({ category: req.params.id });
    
    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${expenseCount} associated expenses.`
      });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Private
export const getCategoryStats = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = { category: categoryId };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    // For non-admin users, filter by user access
    if (req.user.role !== 'admin') {
      if (req.user.role === 'manager') {
        // Manager can see their team's expenses
        const subordinates = await User.find({ manager: req.user._id }).select('_id');
        const userIds = [req.user._id, ...subordinates.map(s => s._id)];
        matchStage.user = { $in: userIds };
      } else {
        // Regular users can only see their own expenses
        matchStage.user = req.user._id;
      }
    }

    const stats = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      }
    ]);

    // Get monthly breakdown
    const monthlyStats = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalAmount: 0,
          totalExpenses: 0,
          avgAmount: 0,
          minAmount: 0,
          maxAmount: 0
        },
        monthlyBreakdown: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};