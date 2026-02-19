import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log('TEST_START');
const timer = setTimeout(() => {
  console.log('TEST_TIMEOUT');
  process.exit(1);
}, 15000);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    clearTimeout(timer);
    console.log('DB_SUCCESS');
    process.exit(0);
  })
  .catch(err => {
    clearTimeout(timer);
    console.error('DB_ERROR:', err.message);
    process.exit(1);
  });
