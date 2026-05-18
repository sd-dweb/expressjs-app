import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './createApp.mjs';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/express_db');
    console.log('Connected to MongoDB');

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log('Error', err);
  }
}

main();

