import { sendBudgetAlert } from './src/utils/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const testEmail = async () => {
  console.log('Testing Email Service...');
  console.log('Using Email:', process.env.EMAIL_USER);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS not found in .env');
    process.exit(1);
  }

  try {
    // Test a Warning (90%)
    console.log('Sending Test Warning (90%)...');
    await sendBudgetAlert(
      process.env.EMAIL_USER, 
      'Ayaan', 
      'Test (Warning)', 
      950, 
      1000, 
      'warning'
    );

    // Test a Real Alert (Exceeded)
    console.log('Sending Test Alert (Exceeded)...');
    await sendBudgetAlert(
      process.env.EMAIL_USER, 
      'Ayaan', 
      'Test (Exceeded)', 
      1200, 
      1000, 
      'exceeded'
    );

    console.log('✅ TEST COMPLETE: Check your inbox!');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    process.exit(1);
  }
};

testEmail();
