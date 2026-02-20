import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.js';
import Expense from './src/models/Expense.js';

dotenv.config();

const inspectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const categories = await Category.find({});
        console.log('\n--- CATS ---');
        categories.forEach(c => {
            console.log(`${c.name.padEnd(10)} | B: ${String(c.monthlyBudget).padEnd(5)} | ID: ${c._id}`);
        });

        const expenses = await Expense.find({}).sort({ date: -1 }).limit(5);
        console.log('\n--- EXP ---');
        expenses.forEach(e => {
            console.log(`Amt: ${String(e.amount).padEnd(5)} | CatID: ${e.categoryId} | Date: ${e.date.toISOString().split('T')[0]}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectDB();
