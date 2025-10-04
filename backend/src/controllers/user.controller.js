import User from '../models/user.model.js';
import Expense from '../models/expense.model.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Manager)
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, department, sortBy = 'firstName', sortOrder = 'asc' } = req.query;
    
    // Build query based on user role
    let query = { isActive: true };
    
    if (req.user.role === 'manager') {
      // Managers can only see their subordinates and themselves
      const subordinates = await User.find({ manager: req.user._id }).select('_id');
      const userIds = [req.user._id, ...subordinates.map(s => s._id)];
      query._id = { $in: userIds };
    }
    
    // Add filters
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .populate('manager', 'firstName lastName email')
      .select('-password -refreshTokens')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin/Manager/Own)
export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check access permissions
    if (req.user.role !== 'admin') {
      if (req.user.role === 'manager') {
        const targetUser = await User.findById(userId);
        if (!targetUser || 
            (targetUser.manager?.toString() !== req.user._id.toString() && 
             userId !== req.user._id.toString())) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (userId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const user = await User.findOne({ _id: userId, isActive: true })
      .populate('manager', 'firstName lastName email role')
      .populate('subordinates', 'firstName lastName email role department')
      .select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, employeeId, manager } = req.body;

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

    // Validate manager if provided
    if (manager) {
      const managerUser = await User.findOne({ _id: manager, role: { $in: ['manager', 'admin'] } });
      if (!managerUser) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager selected'
        });
      }
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user',
      department,
      employeeId,
      manager: manager || null
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Don't allow password updates through this route
    delete updates.password;
    delete updates.refreshTokens;

    // Check if employee ID already exists (if being updated)
    if (updates.employeeId) {
      const existingEmployee = await User.findOne({ 
        employeeId: updates.employeeId,
        _id: { $ne: userId }
      });
      
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Validate manager if provided
    if (updates.manager) {
      const managerUser = await User.findOne({ 
        _id: updates.manager, 
        role: { $in: ['manager', 'admin'] },
        _id: { $ne: userId } // User cannot be their own manager
      });
      
      if (!managerUser) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager selected'
        });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, isActive: true },
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Deactivate user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Cannot deactivate self
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, isActive: true },
      { isActive: false },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's expense summary
// @route   GET /api/users/:id/expenses/summary
// @access  Private (Admin/Manager/Own)
export const getUserExpenseSummary = async (req, res) => {
  try {
    const userId = req.params.id;
    const { startDate, endDate, year, month } = req.query;

    // Check access permissions
    if (req.user.role !== 'admin') {
      if (req.user.role === 'manager') {
        const targetUser = await User.findById(userId);
        if (!targetUser || 
            (targetUser.manager?.toString() !== req.user._id.toString() && 
             userId !== req.user._id.toString())) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (userId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Build date filter
    let dateFilter = {};
    
    if (year && month) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const matchStage = { user: userId };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    // Get overall summary
    const summary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
          },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
          },
          rejectedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Get category-wise breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          category: {
            id: '$category._id',
            name: '$category.name',
            color: '$category.color'
          },
          totalAmount: 1,
          totalExpenses: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get monthly trend
    const monthlyTrend = await Expense.aggregate([
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
        summary: summary[0] || {
          totalAmount: 0,
          totalExpenses: 0,
          avgAmount: 0,
          pendingAmount: 0,
          approvedAmount: 0,
          rejectedAmount: 0
        },
        categoryBreakdown,
        monthlyTrend
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user expense summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};