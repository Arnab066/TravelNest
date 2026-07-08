import { ListingModel } from '../models/dbStore.js';

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
export const getListings = async (req, res) => {
  try {
    const { location, category } = req.query;
    const query = {};

    if (location) {
      // Regex match on location for search queries
      query.location = { $regex: location, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const listings = await ListingModel.find(query, true); // true to populate host
    res.json(listings);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error fetching listings' });
  }
};

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public
export const getListingById = async (req, res) => {
  try {
    const listing = await ListingModel.findById(req.params.id, true); // populate host
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Get listing by ID error:', error);
    res.status(500).json({ message: 'Server error fetching listing' });
  }
};

// @desc    Create listing
// @route   POST /api/listings
// @access  Private/Host
export const createListing = async (asyncReq, res) => {
  try {
    // Explicit variable name to avoid shadowing outer req in some runtimes
    const req = asyncReq;
    const {
      title,
      description,
      price,
      location,
      images,
      category,
      amenities,
      maxGuests,
      bedrooms,
      beds,
      bathrooms
    } = req.body;

    if (!title || !description || !price || !location || !category) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const listing = await ListingModel.create({
      title,
      description,
      price: Number(price),
      location,
      images: images || [],
      category,
      amenities: amenities || [],
      host: req.user.id,
      maxGuests: Number(maxGuests || 2),
      bedrooms: Number(bedrooms || 1),
      beds: Number(beds || 1),
      bathrooms: Number(bathrooms || 1),
      rating: 4.8,
      reviewsCount: 0
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error creating listing' });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private/Host
export const updateListing = async (req, res) => {
  try {
    let listing = await ListingModel.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check listing owner
    if (listing.host.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updatedListing = await ListingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error updating listing' });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private/Host
export const deleteListing = async (req, res) => {
  try {
    const listing = await ListingModel.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check listing owner
    if (listing.host.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await ListingModel.findByIdAndDelete(req.params.id);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error deleting listing' });
  }
};
