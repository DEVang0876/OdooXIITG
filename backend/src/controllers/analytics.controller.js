import Expense from '../models/expense.model.js';
import Category from '../models/category.model.js';
import User from '../models/user.model.js';
import moment from 'moment';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build user filter based on role
    let userFilter = {};
    if (req.user.role !== 'admin') {
      if (req.user.role === 'manager') {
        const subordinates = await User.find({ manager: req.user._id }).select('_id');
        const userIds = [req.user._id, ...subordinates.map(s => s._id)];
        userFilter = { user: { $in: userIds } };
      } else {
        userFilter = { user: req.user._id };
      }
    }

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const matchStage = { ...userFilter };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    // Get overall statistics
    const overallStats = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
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

    // Get top categories
    const topCategories = await Expense.aggregate([
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
            color: '$category.color',
            icon: '$category.icon'
          },
          totalAmount: 1,
          totalExpenses: 1,
          percentage: 1
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 }
    ]);

    // Calculate percentages for top categories
    const totalCategoryAmount = topCategories.reduce((sum, cat) => sum + cat.totalAmount, 0);
    topCategories.forEach(cat => {
      cat.percentage = totalCategoryAmount > 0 ? (cat.totalAmount / totalCategoryAmount * 100).toFixed(2) : 0;
    });

    // Get recent expenses
    const recentExpenses = await Expense.find(matchStage)
      .populate('category', 'name color icon')
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title amount currency date status category user createdAt');

    // Get monthly trend (last 12 months)
    const twelveMonthsAgo = moment().subtract(12, 'months').startOf('month').toDate();
    const monthlyTrend = await Expense.aggregate([
      { 
        $match: { 
          ...userFilter, 
          date: { $gte: twelveMonthsAgo } 
        } 
      },
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

    // Get status distribution
    const statusDistribution = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: overallStats[0] || {
          totalAmount: 0,
          totalExpenses: 0,
          avgAmount: 0,
          pendingCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          pendingAmount: 0,
          approvedAmount: 0,
          rejectedAmount: 0
        },
        topCategories,
        recentExpenses,
        monthlyTrend,
        statusDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get expense reports
// @route   GET /api/analytics/reports
// @access  Private
export const getExpenseReports = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      groupBy = 'category', 
      userId, 
      category, 
      status 
    } = req.query;

    // Build user filter based on role
    let userFilter = {};
    if (req.user.role !== 'admin') {
      if (req.user.role === 'manager') {
        if (userId) {
          // Check if the requested user is a subordinate
          const targetUser = await User.findById(userId);
          if (!targetUser || 
              (targetUser.manager?.toString() !== req.user._id.toString() && 
               userId !== req.user._id.toString())) {
            return res.status(403).json({
              success: false,
              message: 'Access denied'
            });
          }
          userFilter = { user: userId };
        } else {
          const subordinates = await User.find({ manager: req.user._id }).select('_id');
          const userIds = [req.user._id, ...subordinates.map(s => s._id)];
          userFilter = { user: { $in: userIds } };
        }
      } else {
        userFilter = { user: req.user._id };
      }
    } else if (userId) {
      userFilter = { user: userId };
    }

    // Build filters
    const matchStage = { ...userFilter };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    if (category) {
      matchStage.category = category;
    }
    
    if (status) {
      matchStage.status = status;
    }

    let groupStage = {};
    let lookupStage = null;
    let projectStage = {};

    // Configure grouping based on groupBy parameter
    switch (groupBy) {
      case 'category':
        groupStage = {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        };
        lookupStage = {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'details'
        };
        projectStage = {
          _id: 0,
          id: '$_id',
          name: { $arrayElemAt: ['$details.name', 0] },
          color: { $arrayElemAt: ['$details.color', 0] },
          totalAmount: 1,
          totalExpenses: 1,
          avgAmount: 1,
          minAmount: 1,
          maxAmount: 1
        };
        break;

      case 'user':
        groupStage = {
          _id: '$user',
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        };
        lookupStage = {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'details'
        };
        projectStage = {
          _id: 0,
          id: '$_id',
          name: {
            $concat: [
              { $arrayElemAt: ['$details.firstName', 0] },
              ' ',
              { $arrayElemAt: ['$details.lastName', 0] }
            ]
          },
          email: { $arrayElemAt: ['$details.email', 0] },
          totalAmount: 1,
          totalExpenses: 1,
          avgAmount: 1
        };
        break;

      case 'month':
        groupStage = {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        };
        projectStage = {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalAmount: 1,
          totalExpenses: 1,
          avgAmount: 1
        };
        break;

      case 'status':
        groupStage = {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        };
        projectStage = {
          _id: 0,
          status: '$_id',
          totalAmount: 1,
          totalExpenses: 1,
          avgAmount: 1
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid groupBy parameter. Use: category, user, month, or status'
        });
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      { $group: groupStage }
    ];

    if (lookupStage) {
      pipeline.push({ $lookup: lookupStage });
      pipeline.push({ $unwind: '$details' });
    }

    pipeline.push({ $project: projectStage });
    pipeline.push({ $sort: { totalAmount: -1 } });

    const reportData = await Expense.aggregate(pipeline);

    // Get summary statistics
    const summary = await Expense.aggregate([
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

    res.json({
      success: true,
      data: {
        summary: summary[0] || {
          totalAmount: 0,
          totalExpenses: 0,
          avgAmount: 0,
          minAmount: 0,
          maxAmount: 0
        },
        groupBy,
        reportData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate expense report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get expense trends
// @route   GET /api/analytics/trends
// @access  Private
export const getExpenseTrends = async (req, res) => {
  try {
    const { period = 'monthly', comparison = false } = req.query;
    
    // Build user filter based on role
    let userFilter = {};
    if (req.user.role !== 'admin') {
      if (req.user.role === 'manager') {
        const subordinates = await User.find({ manager: req.user._id }).select('_id');
        const userIds = [req.user._id, ...subordinates.map(s => s._id)];
        userFilter = { user: { $in: userIds } };
      } else {
        userFilter = { user: req.user._id };
      }
    }

    let startDate, groupFormat;
    
    switch (period) {
      case 'daily':
        startDate = moment().subtract(30, 'days').startOf('day').toDate();
        groupFormat = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        };
        break;
      case 'weekly':
        startDate = moment().subtract(12, 'weeks').startOf('week').toDate();
        groupFormat = {
          year: { $year: '$date' },
          week: { $week: '$date' }
        };
        break;
      case 'monthly':
        startDate = moment().subtract(12, 'months').startOf('month').toDate();
        groupFormat = {
          year: { $year: '$date' },
          month: { $month: '$date' }
        };
        break;
      case 'yearly':
        startDate = moment().subtract(5, 'years').startOf('year').toDate();
        groupFormat = {
          year: { $year: '$date' }
        };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Use: daily, weekly, monthly, or yearly'
        });
    }

    const matchStage = {
      ...userFilter,
      date: { $gte: startDate }
    };

    const trends = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupFormat,
          totalAmount: { $sum: '$amount' },
          totalExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // If comparison is requested, get previous period data
    let comparisonData = null;
    if (comparison) {
      const comparisonStartDate = moment(startDate).subtract(
        moment().diff(startDate, period.slice(0, -2) + 's'), 
        period.slice(0, -2) + 's'
      ).toDate();
      
      const comparisonMatchStage = {
        ...userFilter,
        date: { $gte: comparisonStartDate, $lt: startDate }
      };

      comparisonData = await Expense.aggregate([
        { $match: comparisonMatchStage },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalExpenses: { $sum: 1 },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]);
    }

    res.json({
      success: true,
      data: {
        period,
        trends,
        comparison: comparisonData?.[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};