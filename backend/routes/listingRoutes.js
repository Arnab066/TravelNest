import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} from '../controllers/listingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', protect, authorize('host'), createListing);
router.put('/:id', protect, authorize('host'), updateListing);
router.delete('/:id', protect, authorize('host'), deleteListing);

export default router;
