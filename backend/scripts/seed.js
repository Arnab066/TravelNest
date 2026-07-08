import bcrypt from 'bcryptjs';
import { connectDB, isLocalMock, localDbPath } from '../config/db.js';
import { UserModel, ListingModel } from '../models/dbStore.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting DB seeding...');
    await connectDB();

    // Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create a Guest and a Host
    const guestUser = {
      name: 'John Doe',
      email: 'guest@travelnest.com',
      password: hashedPassword,
      role: 'guest'
    };

    const hostUser = {
      name: 'Sarah Connor',
      email: 'host@travelnest.com',
      password: hashedPassword,
      role: 'host'
    };

    let guestId, hostId;

    if (!isLocalMock) {
      // Clean Mongoose collections first
      const { MongooseUser, MongooseListing, MongooseBooking, MongooseReview } = await import('../models/mongooseModels.js');
      await MongooseUser.deleteMany({});
      await MongooseListing.deleteMany({});
      await MongooseBooking.deleteMany({});
      await MongooseReview.deleteMany({});

      const seededGuest = await UserModel.create(guestUser);
      const seededHost = await UserModel.create(hostUser);
      guestId = seededGuest._id;
      hostId = seededHost._id;
    } else {
      // Local JSON clean setup
      const db = {
        users: [],
        listings: [],
        bookings: [],
        reviews: []
      };
      fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2), 'utf-8');

      const seededGuest = await UserModel.create(guestUser);
      const seededHost = await UserModel.create(hostUser);
      guestId = seededGuest._id;
      hostId = seededHost._id;
    }

    console.log(`👤 Created users:\n  - Guest: guest@travelnest.com (password123)\n  - Host: host@travelnest.com (password123)`);

    const listings = [
      {
        title: 'Alpine Meadow A-Frame Chalet',
        description: 'Escape to a secluded wooden A-frame chalet in the heart of the Swiss Alps. Features an outdoor hot tub, fireplace, panoramic floor-to-ceiling windows overlooking snow-capped peaks, and ski-in/ski-out access.',
        price: 245,
        location: 'Zermatt, Switzerland',
        images: [
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Cabins',
        amenities: ['Wifi', 'Kitchen', 'Hot Tub', 'Fireplace', 'Ski access', 'Heating'],
        host: hostId,
        maxGuests: 4,
        bedrooms: 2,
        beds: 3,
        bathrooms: 2,
        rating: 4.9,
        reviewsCount: 12
      },
      {
        title: 'Sun-Kissed Oia Caldera Cliffside Villa',
        description: 'Perched on the cliffs of Santorini, this whitewashed cave villa offers breathtaking panoramic sunset views over the Aegean Sea. Includes a private infinity plunge pool and beautiful traditional Cycladic architecture.',
        price: 380,
        location: 'Oia, Greece',
        images: [
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Luxury',
        amenities: ['Wifi', 'Air Conditioning', 'Infinity Pool', 'Kitchen', 'Ocean View', 'Breakfast included'],
        host: hostId,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        rating: 5.0,
        reviewsCount: 18
      },
      {
        title: 'Kyoto Bamboo Forest Garden House',
        description: 'Immerse yourself in traditional Japanese culture in this meticulously restored Machiya house, surrounded by a peaceful Zen rock garden and whispering bamboo stalks. Features custom tatami rooms and a Hinoki cypress soaking tub.',
        price: 185,
        location: 'Kyoto, Japan',
        images: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Trending',
        amenities: ['Wifi', 'Tatami Rooms', 'Hinoki Soaking Tub', 'Zen Garden', 'Kitchen', 'Tea Set'],
        host: hostId,
        maxGuests: 3,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1.5,
        rating: 4.85,
        reviewsCount: 8
      },
      {
        title: 'Lush Rainforest Eco-Treehouse',
        description: 'Live among the birds and monkeys in this multi-level eco-friendly treehouse suspended 30 feet above the jungle floor. Completely open-concept layout allows you to feel truly connected to the vibrant Costa Rican rainforest.',
        price: 150,
        location: 'Manzanillo, Costa Rica',
        images: [
          'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Treehouses',
        amenities: ['Solar Power', 'Hammock', 'Outdoor Shower', 'Breakfast included', 'Guide booking'],
        host: hostId,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        rating: 4.78,
        reviewsCount: 22
      },
      {
        title: 'Sunset Overwater Turquoise Bungalow',
        description: 'Walk straight from your living room into crystal clear ocean waters. This Maldives luxury overwater bungalow features a private sun deck, glass floor viewing panel, and direct access to active coral reefs.',
        price: 520,
        location: 'Male Atoll, Maldives',
        images: [
          'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Beachfront',
        amenities: ['Wifi', 'Air Conditioning', 'Glass floor panel', 'Snorkeling gear', 'Mini Bar', 'Ocean View'],
        host: hostId,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        rating: 4.95,
        reviewsCount: 15
      },
      {
        title: 'Sleek Manhattan Glass Penthouse',
        description: 'Experience New York City from above. This ultra-modern penthouse features floor-to-ceiling windows with unobstructed views of the Manhattan skyline, a private rooftop deck, and top-of-the-line appliances.',
        price: 450,
        location: 'New York, USA',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
        ],
        category: 'Luxury',
        amenities: ['Wifi', 'Gym access', 'Rooftop Deck', 'Kitchen', 'Workspace', 'Washing Machine'],
        host: hostId,
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        rating: 4.88,
        reviewsCount: 31
      }
    ];

    for (const listing of listings) {
      await ListingModel.create(listing);
    }

    console.log(`🏡 Seeded ${listings.length} beautiful property listings.`);
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
