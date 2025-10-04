#!/usr/bin/env node

/**
 * Database Seeding Script
 * Seeds the database with sample data for development and testing
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './src/models/user.model.js';
import { Category } from './src/models/category.model.js';
import { Expense } from './src/models/expense.model.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_management';

// Sample data
const sampleUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    department: 'IT',
    employeeId: 'ADM001',
    isEmailVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Manager',
    email: 'john.manager@company.com',
    password: 'manager123',
    role: 'manager',
    department: 'Sales',
    employeeId: 'MGR001',
    isEmailVerified: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'sarah.manager@company.com',
    password: 'manager123',
    role: 'manager',
    department: 'Marketing',
    employeeId: 'MGR002',
    isEmailVerified: true
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Sales',
    employeeId: 'EMP001',
    isEmailVerified: true
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Marketing',
    employeeId: 'EMP002',
    isEmailVerified: true
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'IT',
    employeeId: 'EMP003',
    isEmailVerified: true
  },
  {
    firstName: 'Lisa',
    lastName: 'Brown',
    email: 'lisa.brown@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'HR',
    employeeId: 'EMP004',
    isEmailVerified: true
  },
  {
    firstName: 'James',
    lastName: 'Taylor',
    email: 'james.taylor@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'Finance',
    employeeId: 'EMP005',
    isEmailVerified: true
  }
];

const sampleCategories = [
  {
    name: 'Office Supplies',
    description: 'Stationery, printer ink, office equipment',
    color: '#007bff',
    icon: 'printer',
    budget: { monthly: 500, yearly: 6000 }
  },
  {
    name: 'Travel',
    description: 'Flights, hotels, transportation',
    color: '#28a745',
    icon: 'plane',
    budget: { monthly: 2000, yearly: 24000 }
  },
  {
    name: 'Meals & Entertainment',
    description: 'Client meetings, team lunches, entertainment',
    color: '#ffc107',
    icon: 'utensils',
    budget: { monthly: 800, yearly: 9600 }
  },
  {
    name: 'Software & Tools',
    description: 'Software licenses, development tools, subscriptions',
    color: '#6f42c1',
    icon: 'laptop-code',
    budget: { monthly: 300, yearly: 3600 }
  },
  {
    name: 'Training & Development',
    description: 'Courses, conferences, certifications',
    color: '#e83e8c',
    icon: 'graduation-cap',
    budget: { monthly: 600, yearly: 7200 }
  },
  {
    name: 'Marketing',
    description: 'Advertising, promotional materials, events',
    color: '#fd7e14',
    icon: 'bullhorn',
    budget: { monthly: 1500, yearly: 18000 }
  },
  {
    name: 'Utilities',
    description: 'Internet, phone, electricity, water',
    color: '#20c997',
    icon: 'bolt',
    budget: { monthly: 400, yearly: 4800 }
  },
  {
    name: 'Medical',
    description: 'Health insurance, medical expenses',
    color: '#dc3545',
    icon: 'heartbeat',
    budget: { monthly: 300, yearly: 3600 }
  }
];

const sampleExpenses = [
  // Pending expenses
  {
    title: 'Office Chair Purchase',
    description: 'Ergonomic office chair for new employee workstation',
    amount: 299.99,
    currency: 'USD',
    paymentMethod: 'credit_card',
    vendor: 'Office Depot',
    location: 'Downtown Branch',
    tags: ['furniture', 'ergonomics'],
    status: 'pending'
  },
  {
    title: 'Client Lunch Meeting',
    description: 'Lunch meeting with ABC Corp clients to discuss project requirements',
    amount: 145.50,
    currency: 'USD',
    paymentMethod: 'credit_card',
    vendor: 'The Capital Grill',
    location: 'Financial District',
    tags: ['client-meeting', 'lunch'],
    status: 'pending'
  },
  {
    title: 'Adobe Creative Suite License',
    description: 'Annual license renewal for Adobe Creative Suite',
    amount: 599.99,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    vendor: 'Adobe Inc.',
    tags: ['software', 'design-tools'],
    status: 'pending'
  },

  // Approved expenses
  {
    title: 'Business Trip to New York',
    description: 'Flight and hotel for client presentation in NYC',
    amount: 1250.00,
    currency: 'USD',
    paymentMethod: 'credit_card',
    vendor: 'United Airlines + Hilton',
    location: 'New York, NY',
    tags: ['travel', 'client-presentation'],
    status: 'approved'
  },
  {
    title: 'Team Building Event',
    description: 'Paintball outing for department team building',
    amount: 450.00,
    currency: 'USD',
    paymentMethod: 'credit_card',
    vendor: 'Urban Paintball',
    location: 'Suburban Location',
    tags: ['team-building', 'entertainment'],
    status: 'approved'
  },
  {
    title: 'Printer Toner Cartridges',
    description: 'Black and color toner cartridges for office printer',
    amount: 89.99,
    currency: 'USD',
    paymentMethod: 'credit_card',
    vendor: 'Staples',
    tags: ['supplies', 'printer'],
    status: 'approved'
  },

  // Rejected expenses
  {
    title: 'Personal Gym Membership',
    description: 'Monthly gym membership for fitness',
    amount: 75.00,
    currency: 'USD',
    paymentMethod: 'debit_card',
    vendor: 'FitLife Gym',
    rejectionReason: 'Personal expense not eligible for reimbursement',
    status: 'rejected'
  },
  {
    title: 'Luxury Coffee Machine',
    description: 'High-end espresso machine for break room',
    amount: 899.99,
    currency: 'USD',
    paymentMethod: 'credit_card',
    vendor: 'Williams Sonoma',
    rejectionReason: 'Exceeds budget limit for office equipment',
    status: 'rejected'
  },

  // Processing expenses
  {
    title: 'Conference Registration',
    description: 'Tech Conference 2025 registration and travel',
    amount: 850.00,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    vendor: 'TechConf Inc.',
    tags: ['conference', 'training'],
    status: 'processing'
  }
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Expense.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

async function seedUsers() {
  try {
    console.log('👥 Seeding users...');

    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );

    const users = await User.insertMany(usersWithHashedPasswords);

    // Set up manager relationships
    const johnManager = users.find(u => u.email === 'john.manager@company.com');
    const sarahManager = users.find(u => u.email === 'sarah.manager@company.com');

    // Assign managers to employees
    const salesEmployees = users.filter(u =>
      u.role === 'employee' && u.department === 'Sales'
    );
    const marketingEmployees = users.filter(u =>
      u.role === 'employee' && u.department === 'Marketing'
    );

    for (const employee of salesEmployees) {
      employee.manager = johnManager._id;
      await employee.save();
    }

    for (const employee of marketingEmployees) {
      employee.manager = sarahManager._id;
      await employee.save();
    }

    console.log(`✅ Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function seedCategories(users) {
  try {
    console.log('📂 Seeding categories...');

    const adminUser = users.find(u => u.role === 'admin');

    const categoriesWithCreator = sampleCategories.map(category => ({
      ...category,
      createdBy: adminUser._id
    }));

    const categories = await Category.insertMany(categoriesWithCreator);
    console.log(`✅ Created ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

async function seedExpenses(users, categories) {
  try {
    console.log('💰 Seeding expenses...');

    const employees = users.filter(u => u.role === 'employee');
    const managers = users.filter(u => u.role === 'manager');

    // Create expenses with random assignments
    const expensesWithAssignments = sampleExpenses.map((expense, index) => {
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Set approval details for approved/rejected expenses
      let approvedBy = null;
      let approvedAt = null;

      if (expense.status === 'approved' || expense.status === 'rejected') {
        const randomManager = managers[Math.floor(Math.random() * managers.length)];
        approvedBy = randomManager._id;
        approvedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days
      }

      return {
        ...expense,
        user: randomEmployee._id,
        category: randomCategory._id,
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
        approvedBy,
        approvedAt
      };
    });

    const expenses = await Expense.insertMany(expensesWithAssignments);
    console.log(`✅ Created ${expenses.length} expenses`);
    return expenses;
  } catch (error) {
    console.error('❌ Error seeding expenses:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    const categories = await seedCategories(users);
    const expenses = await seedExpenses(users, categories);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📂 Categories: ${categories.length}`);
    console.log(`   💰 Expenses: ${expenses.length}`);

    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@company.com / admin123');
    console.log('   Manager: john.manager@company.com / manager123');
    console.log('   Employee: mike.johnson@company.com / employee123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding script
if (process.argv[2] === '--confirm') {
  seedDatabase();
} else {
  console.log('⚠️  WARNING: This will clear all existing data and seed the database with sample data.');
  console.log('To proceed, run: npm run seed -- --confirm');
  console.log('Or: node scripts/seed.js --confirm');
}