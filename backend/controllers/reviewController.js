import { ReviewModel, BookingModel } from '../models/dbStore.js';

// @desc    Create listing review
// @route   POST /api/reviews
// @access  Private/Guest
export const createReview = async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;

    if (!listingId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide listing ID, rating, and comment' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Optional but premium feature: verify if user had a booking on this listing
    const bookings = await BookingModel.find({
      listing: listingId,
      guest: req.user.id,
      status: 'confirmed'
    });

    if (bookings.length === 0) {
      return res.status(400).json({ message: 'You must have a confirmed reservation to review this listing' });
    }

    const review = await ReviewModel.create({
      listing: listingId,
      user: req.user.id,
      rating: Number(rating),
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
};

// @desc    Get all reviews for a listing
// @route   GET /api/reviews/listing/:id
// @access  Public
export const getReviewsForListing = async (req, res) => {
  try {
    const reviews = await ReviewModel.find({ listing: req.params.id }, true); // true to populate user info
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};
