import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isLocalMock = false;
export const defaultDbPath = path.join(__dirname, '..', 'data', 'default_db.json');
export const localDbPath = process.env.VERCEL ? path.join('/tmp', 'local_db.json') : path.join(__dirname, '..', 'data', 'local_db.json');

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
  try {
    const dataDir = path.dirname(localDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(localDbPath)) {
      if (fs.existsSync(defaultDbPath)) {
        fs.copyFileSync(defaultDbPath, localDbPath);
        console.log('📦 Initialized local_db.json from default_db.json with listings and photos.');
      } else {
        const initialData = { users: [], listings: [], bookings: [], reviews: [] };
        fs.writeFileSync(localDbPath, JSON.stringify(initialData, null, 2), 'utf-8');
        console.log('📦 Created fresh local_db.json.');
      }
    } else {
      const currentData = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      if ((!currentData.listings || currentData.listings.length === 0) && fs.existsSync(defaultDbPath)) {
        fs.copyFileSync(defaultDbPath, localDbPath);
        console.log('📦 Populated empty local_db.json with default listings and photos.');
      } else {
        console.log('📦 Loaded existing local_db.json database.');
      }
    }
  } catch (err) {
    console.error('Error initializing local DB:', err.message);
  }
}
