import fs from 'fs';
import { isLocalMock, localDbPath, defaultDbPath } from '../config/db.js';
import {
  MongooseUser,
  MongooseListing,
  MongooseBooking,
  MongooseReview
} from './mongooseModels.js';

// Helper to read local JSON DB
function readLocalDb() {
  try {
    if (fs.existsSync(localDbPath)) {
      const data = fs.readFileSync(localDbPath, 'utf-8');
      const db = JSON.parse(data);
      if (db.listings && db.listings.length > 0) {
        return db;
      }
    }
    if (fs.existsSync(defaultDbPath)) {
      const defaultData = fs.readFileSync(defaultDbPath, 'utf-8');
      return JSON.parse(defaultData);
    }
    return { users: [], listings: [], bookings: [], reviews: [] };
  } catch (error) {
    console.error('Error reading local JSON database:', error);
    if (fs.existsSync(defaultDbPath)) {
      try {
        return JSON.parse(fs.readFileSync(defaultDbPath, 'utf-8'));
      } catch (e) {}
    }
    return { users: [], listings: [], bookings: [], reviews: [] };
  }
}

// Helper to write local JSON DB
function writeLocalDb(data) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to local JSON database:', error);
  }
}

// Helper to generate a unique ID resembling MongoDB ObjectId
function generateId() {
  return Math.random().toString(16).substring(2, 10) + 
         Math.random().toString(16).substring(2, 10) + 
         Math.random().toString(16).substring(2, 10);
}

// Helper to populate user fields (e.g. host or guest)
function populateUserInDoc(userId, db) {
  const user = db.users.find(u => u._id === userId.toString());
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

// Helper to populate listing details inside a document
function populateListingInDoc(listingId, db) {
  const listing = db.listings.find(l => l._id === listingId.toString());
  if (!listing) return null;
  const host = populateUserInDoc(listing.host, db);
  return { ...listing, host };
}

// MODEL ADAPTERS
export const UserModel = {
  async find(query = {}) {
    if (!isLocalMock) return MongooseUser.find(query);
    
    const db = readLocalDb();
    return db.users.filter(user => {
      for (let key in query) {
        if (user[key] !== query[key]) return false;
      }
      return true;
    });
  },

  async findOne(query = {}) {
    if (!isLocalMock) return MongooseUser.findOne(query);
    
    const db = readLocalDb();
    const found = db.users.find(user => {
      for (let key in query) {
        if (user[key] !== query[key]) return false;
      }
      return true;
    });
    return found || null;
  },

  async findById(id) {
    if (!isLocalMock) return MongooseUser.findById(id);
    
    const db = readLocalDb();
    const found = db.users.find(user => user._id === id.toString());
    return found || null;
  },

  async create(userData) {
    if (!isLocalMock) return MongooseUser.create(userData);
    
    const db = readLocalDb();
    const newUser = {
      _id: generateId(),
      role: 'guest',
      createdAt: new Date().toISOString(),
      ...userData
    };
    db.users.push(newUser);
    writeLocalDb(db);
    return newUser;
  }
};

export const ListingModel = {
  async find(query = {}, populateHost = false) {
    if (!isLocalMock) {
      let q = MongooseListing.find(query);
      if (populateHost) {
        q = q.populate('host', 'name email role');
      }
      return q;
    }

    const db = readLocalDb();
    let results = db.listings.filter(listing => {
      for (let key in query) {
        // Simple search / regex filter matching if location is matching
        if (key === 'location' && typeof query[key] === 'object') {
          // If regex location search
          const regexVal = query[key].$regex;
          if (regexVal) {
            const regex = new RegExp(regexVal, 'i');
            if (!regex.test(listing.location)) return false;
            continue;
          }
        }
        if (listing[key] !== query[key]) return false;
      }
      return true;
    });

    if (populateHost) {
      results = results.map(listing => {
        const host = populateUserInDoc(listing.host, db);
        return { ...listing, host };
      });
    }

    return results;
  },

  async findById(id, populateHost = false) {
    if (!isLocalMock) {
      let q = MongooseListing.findById(id);
      if (populateHost) {
        q = q.populate('host', 'name email role');
      }
      return q;
    }

    const db = readLocalDb();
    const listing = db.listings.find(l => l._id === id.toString());
    if (!listing) return null;

    if (populateHost) {
      const host = populateUserInDoc(listing.host, db);
      return { ...listing, host };
    }
    return listing;
  },

  async create(listingData) {
    if (!isLocalMock) return MongooseListing.create(listingData);

    const db = readLocalDb();
    const newListing = {
      _id: generateId(),
      images: [],
      amenities: [],
      rating: 4.8,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      ...listingData
    };
    db.listings.push(newListing);
    writeLocalDb(db);
    return newListing;
  },

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (!isLocalMock) {
      return MongooseListing.findByIdAndUpdate(id, updateData, options);
    }

    const db = readLocalDb();
    const index = db.listings.findIndex(l => l._id === id.toString());
    if (index === -1) return null;

    db.listings[index] = {
      ...db.listings[index],
      ...updateData
    };
    writeLocalDb(db);
    return db.listings[index];
  },

  async findByIdAndDelete(id) {
    if (!isLocalMock) return MongooseListing.findByIdAndDelete(id);

    const db = readLocalDb();
    const initialLength = db.listings.length;
    db.listings = db.listings.filter(l => l._id !== id.toString());
    
    // Also delete bookings related to this listing
    db.bookings = db.bookings.filter(b => b.listing !== id.toString());
    
    // Also delete reviews related to this listing
    db.reviews = db.reviews.filter(r => r.listing !== id.toString());
    
    writeLocalDb(db);
    return initialLength > db.listings.length;
  }
};

export const BookingModel = {
  async find(query = {}, populateFields = false) {
    if (!isLocalMock) {
      let q = MongooseBooking.find(query);
      if (populateFields) {
        q = q.populate({
          path: 'listing',
          populate: { path: 'host', select: 'name email' }
        }).populate('guest', 'name email');
      }
      return q;
    }

    const db = readLocalDb();
    let results = db.bookings.filter(booking => {
      for (let key in query) {
        if (booking[key] !== query[key]) return false;
      }
      return true;
    });

    if (populateFields) {
      results = results.map(booking => {
        const listing = populateListingInDoc(booking.listing, db);
        const guest = populateUserInDoc(booking.guest, db);
        return { ...booking, listing, guest };
      });
    }

    return results;
  },

  async findById(id, populateFields = false) {
    if (!isLocalMock) {
      let q = MongooseBooking.findById(id);
      if (populateFields) {
        q = q.populate({
          path: 'listing',
          populate: { path: 'host', select: 'name email' }
        }).populate('guest', 'name email');
      }
      return q;
    }

    const db = readLocalDb();
    const booking = db.bookings.find(b => b._id === id.toString());
    if (!booking) return null;

    if (populateFields) {
      const listing = populateListingInDoc(booking.listing, db);
      const guest = populateUserInDoc(booking.guest, db);
      return { ...booking, listing, guest };
    }
    return booking;
  },

  async create(bookingData) {
    if (!isLocalMock) return MongooseBooking.create(bookingData);

    const db = readLocalDb();
    const newBooking = {
      _id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    db.bookings.push(newBooking);
    writeLocalDb(db);
    return newBooking;
  },

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (!isLocalMock) {
      return MongooseBooking.findByIdAndUpdate(id, updateData, options);
    }

    const db = readLocalDb();
    const index = db.bookings.findIndex(b => b._id === id.toString());
    if (index === -1) return null;

    db.bookings[index] = {
      ...db.bookings[index],
      ...updateData
    };
    writeLocalDb(db);
    return db.bookings[index];
  }
};

export const ReviewModel = {
  async find(query = {}, populateUser = false) {
    if (!isLocalMock) {
      let q = MongooseReview.find(query);
      if (populateUser) {
        q = q.populate('user', 'name email');
      }
      return q;
    }

    const db = readLocalDb();
    let results = db.reviews.filter(review => {
      for (let key in query) {
        if (review[key] !== query[key]) return false;
      }
      return true;
    });

    if (populateUser) {
      results = results.map(review => {
        const user = populateUserInDoc(review.user, db);
        return { ...review, user };
      });
    }

    return results;
  },

  async create(reviewData) {
    let newReview;
    if (!isLocalMock) {
      newReview = await MongooseReview.create(reviewData);
    } else {
      const db = readLocalDb();
      newReview = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        ...reviewData
      };
      db.reviews.push(newReview);
      writeLocalDb(db);
    }

    // Now recalculate rating and review count for the listing
    await updateListingRating(reviewData.listing);

    return newReview;
  }
};

async function updateListingRating(listingId) {
  if (!isLocalMock) {
    const reviews = await MongooseReview.find({ listing: listingId });
    if (reviews.length === 0) return;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await MongooseListing.findByIdAndUpdate(listingId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewsCount: reviews.length
    });
  } else {
    const db = readLocalDb();
    const reviews = db.reviews.filter(r => r.listing === listingId.toString());
    if (reviews.length === 0) return;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    const index = db.listings.findIndex(l => l._id === listingId.toString());
    if (index !== -1) {
      db.listings[index].rating = parseFloat(avgRating.toFixed(1));
      db.listings[index].reviewsCount = reviews.length;
      writeLocalDb(db);
    }
  }
}
