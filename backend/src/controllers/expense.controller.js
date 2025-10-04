import Expense from '../models/expense.model.js';
import Category from '../models/category.model.js';
import User from '../models/user.model.js';
import { deleteFile } from '../middleware/upload.middleware.js';
import mongoose from 'mongoose';

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      paymentMethod,
      sortBy = 'date',
      sortOrder = 'desc',
      userId
    } = req.query;

    // Build query based on user role
    let query = {};

    // Role-based filtering
    if (req.user.role === 'admin') {
      // Admin can see all expenses, optionally filter by userId
      if (userId) {
        query.user = userId;
      }
    } else if (req.user.role === 'manager') {
      // Manager can see their own and subordinates' expenses
      if (userId) {
        // Check if the requested user is a subordinate
        const targetUser = await User.findById(userId);
        if (!targetUser || 
            (targetUser.manager?.toString() !== req.user._id.toString() && 
             userId !== req.user._id.toString())) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view your own or your subordinates\' expenses.'
          });
        }
        query.user = userId;
      } else {
        // Get all subordinates
        const subordinates = await User.find({ manager: req.user._id }).select('_id');
        const userIds = [req.user._id, ...subordinates.map(s => s._id)];
        query.user = { $in: userIds };
      }
    } else {
      // Regular user can only see their own expenses
      query.user = req.user._id;
    }

    // Add filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const expenses = await Expense.find(query)
      .populate('category', 'name color icon')
      .populate('user', 'firstName lastName email employeeId')
      .populate('approvedBy', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    // Calculate totals
    const totalAmount = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        summary: {
          totalAmount: totalAmount[0]?.total || 0,
          totalExpenses: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('category', 'name color icon description')
      .populate('user', 'firstName lastName email employeeId department')
      .populate('approvedBy', 'firstName lastName email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin') {
      if (req.user.role === 'manager') {
        const targetUser = await User.findById(expense.user._id);
        if (targetUser.manager?.toString() !== req.user._id.toString() && 
            expense.user._id.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (expense.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    // Verify category exists
    const category = await Category.findOne({ 
      _id: req.body.category, 
      isActive: true 
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    // Process uploaded receipts
    const receipts = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    })) : [];

    const expenseData = {
      ...req.body,
      user: req.user._id,
      receipts
    };

    const expense = new Expense(expenseData);
    await expense.save();

    // Populate references
    await expense.populate([
      { path: 'category', select: 'name color icon' },
      { path: 'user', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });
  } catch (error) {
    // Clean up uploaded files if expense creation fails
    if (req.files) {
      req.files.forEach(file => {
        deleteFile(file.path);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own expenses.'
      });
    }

    // Check if expense can be edited
    if (expense.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit approved expenses'
      });
    }

    // Verify category if being updated
    if (req.body.category && req.body.category !== expense.category.toString()) {
      const category = await Category.findOne({ 
        _id: req.body.category, 
        isActive: true 
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category selected'
        });
      }
    }

    // Handle new file uploads
    const newReceipts = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    })) : [];

    // Remove old receipts if specified
    if (req.body.removeReceipts) {
      const receiptIdsToRemove = Array.isArray(req.body.removeReceipts) 
        ? req.body.removeReceipts 
        : [req.body.removeReceipts];

      receiptIdsToRemove.forEach(receiptId => {
        const receipt = expense.receipts.id(receiptId);
        if (receipt) {
          deleteFile(receipt.path);
          expense.receipts.pull(receiptId);
        }
      });
    }

    // Add new receipts
    expense.receipts.push(...newReceipts);

    // Update other fields
    const allowedUpdates = [
      'title', 'description', 'amount', 'currency', 'category', 'date',
      'paymentMethod', 'vendor', 'location', 'tags', 'isBillable',
      'clientProject', 'notes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        expense[field] = req.body[field];
      }
    });

    // Reset status to pending if it was rejected
    if (expense.status === 'rejected') {
      expense.status = 'pending';
      expense.rejectionReason = undefined;
    }

    await expense.save();

    // Populate references
    await expense.populate([
      { path: 'category', select: 'name color icon' },
      { path: 'user', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });
  } catch (error) {
    // Clean up uploaded files if update fails
    if (req.files) {
      req.files.forEach(file => {
        deleteFile(file.path);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own expenses.'
      });
    }

    // Check if expense can be deleted
    if (expense.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved expenses'
      });
    }

    // Delete associated files
    expense.receipts.forEach(receipt => {
      deleteFile(receipt.path);
    });

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Approve expense
// @route   PUT /api/expenses/:id/approve
// @access  Private (Manager/Admin)
export const approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('user', 'firstName lastName email manager');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      if (req.user.role !== 'manager' || 
          expense.user.manager?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only approve expenses from your subordinates.'
        });
      }
    }

    if (expense.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Expense is already approved'
      });
    }

    expense.status = 'approved';
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    expense.rejectionReason = undefined;

    await expense.save();

    await expense.populate([
      { path: 'category', select: 'name color icon' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Expense approved successfully',
      data: { expense }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reject expense
// @route   PUT /api/expenses/:id/reject
// @access  Private (Manager/Admin)
export const rejectExpense = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const expense = await Expense.findById(req.params.id)
      .populate('user', 'firstName lastName email manager');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      if (req.user.role !== 'manager' || 
          expense.user.manager?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only reject expenses from your subordinates.'
        });
      }
    }

    if (expense.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an approved expense'
      });
    }

    expense.status = 'rejected';
    expense.rejectionReason = reason;
    expense.approvedBy = undefined;
    expense.approvedAt = undefined;

    await expense.save();

    await expense.populate([
      { path: 'category', select: 'name color icon' },
      { path: 'user', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Expense rejected successfully',
      data: { expense }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};