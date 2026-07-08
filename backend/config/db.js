import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isLocalMock = false;
export const localDbPath = path.join(__dirname, '..', 'data', 'local_db.json');

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('⚠️  No MONGO_URI found in environment variables.');
    console.log('⚡ Using Local JSON Mock Database...');
    isLocalMock = true;
    initializeLocalDb();
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('🚀 Connected to MongoDB successfully.');
    isLocalMock = false;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('⚡ Falling back to Local JSON Mock Database...');
    isLocalMock = true;
    initializeLocalDb();
  }
}

function initializeLocalDb() {
  const dataDir = path.dirname(localDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(localDbPath)) {
    const initialData = {
      users: [],
      listings: [],
      bookings: [],
      reviews: []
    };
    fs.writeFileSync(localDbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('📦 Created fresh local_db.json.');
  } else {
    console.log('📦 Loaded existing local_db.json database.');
  }
}
