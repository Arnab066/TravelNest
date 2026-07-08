import { BookingModel, ListingModel } from '../models/dbStore.js';

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private/Guest
export const createBooking = async (req, res) => {
  try {
    const { listingId, startDate, endDate, guestsCount, totalPrice } = req.body;

    if (!listingId || !startDate || !endDate || !guestsCount || !totalPrice) {
      return res.status(400).json({ message: 'Please provide all booking details' });
    }

    // Verify listing exists
    const listing = await ListingModel.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Host cannot book their own property
    if (listing.host.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Hosts cannot book their own properties' });
    }

    const booking = await BookingModel.create({
      listing: listingId,
      guest: req.user.id,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      totalPrice: Number(totalPrice),
      guestsCount: Number(guestsCount),
      status: 'pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

// @desc    Get user's bookings (trips for guest, reservations for host)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    const userRole = req.user.role;
    let bookings;

    if (userRole === 'host') {
      // Find listings owned by host
      const hostListings = await ListingModel.find({ host: req.user.id });
      const hostListingIds = hostListings.map(l => l._id.toString());

      // Get bookings for those listings
      const allBookings = await BookingModel.find({}, true); // true to populate
      bookings = allBookings.filter(b => {
        // Handle both populated and unpopulated cases safely
        const bookingListingId = b.listing?._id ? b.listing._id.toString() : b.listing?.toString();
        return hostListingIds.includes(bookingListingId);
      });
    } else {
      // Guest wants their trips
      bookings = await BookingModel.find({ guest: req.user.id }, true);
    }

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

// @desc    Update booking status (accept/reject/cancel)
// @route   PATCH /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await BookingModel.findById(req.params.id, true);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const listingHostId = booking.listing?.host?._id 
      ? booking.listing.host._id.toString() 
      : booking.listing?.host?.toString();

    const bookingGuestId = booking.guest?._id 
      ? booking.guest._id.toString() 
      : booking.guest?.toString();

    // Permissions check
    if (status === 'confirmed' || status === 'rejected') {
      // Only host can accept/reject
      if (listingHostId !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Only hosts of this listing can accept or reject bookings' });
      }
    } else if (status === 'cancelled') {
      // Guest or Host can cancel
      if (bookingGuestId !== req.user.id.toString() && listingHostId !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to cancel this booking' });
      }
    }

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};
