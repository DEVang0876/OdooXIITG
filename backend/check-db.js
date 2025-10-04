import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import Category from './src/models/category.model.js';
import Expense from './src/models/expense.model.js';

dotenv.config();

async function checkDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('📍 Database:', mongoose.connection.name);

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Collections found:', collections.map(c => c.name));

        // Count documents
        const userCount = await User.countDocuments();
        const categoryCount = await Category.countDocuments();
        const expenseCount = await Expense.countDocuments();

        console.log('\n📊 Document counts:');
        console.log(`   👥 Users: ${userCount}`);
        console.log(`   📂 Categories: ${categoryCount}`);
        console.log(`   💰 Expenses: ${expenseCount}`);

        // Show sample users
        if (userCount > 0) {
            const users = await User.find().select('firstName lastName email role isEmailVerified').limit(3);
            console.log('\n👥 Sample users:');
            users.forEach(user => {
                console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - Verified: ${user.isEmailVerified}`);
            });
        }

        // Show sample categories
        if (categoryCount > 0) {
            const categories = await Category.find().select('name description').limit(5);
            console.log('\n📂 Sample categories:');
            categories.forEach(cat => {
                console.log(`   - ${cat.name}: ${cat.description}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Database check failed:', error);
        process.exit(1);
    }
}

checkDatabase();