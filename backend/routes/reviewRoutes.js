import express from 'express';
import { createReview, getReviewsForListing } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/listing/:id', getReviewsForListing);

export default router;
