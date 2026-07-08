import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { ArrowLeft, Check, Star, MapPin, Calendar, Users, Heart } from 'lucide-react';

export default function ListingDetail({ listingId, setView, onOpenAuth }) {
  const { user, token } = useAuth();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingStatus, setBookingStatus] = useState(null); // 'success' or 'error'
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchListingAndReviews = async () => {
      setLoading(true);
      try {
        // Fetch listing
        const listRes = await fetch(`${API_BASE}/listings/${listingId}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          setListing(listData);
        }

        // Fetch reviews
        const revRes = await fetch(`${API_BASE}/reviews/listing/${listingId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData);
        }
      } catch (err) {
        console.error('Error fetching listing details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListingAndReviews();
  }, [listingId]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="empty-state">
        <h3>Property not found</h3>
        <button className="btn-action-outline" onClick={() => setView('home')} style={{ marginTop: '16px' }}>
          Back to home
        </button>
      </div>
    );
  }

  // Calculate pricing breakdown
  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 0;
  const baseCost = nights * listing.price;
  const serviceFee = nights ? Math.round(baseCost * 0.08) : 0;
  const totalCost = baseCost + serviceFee;

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingStatus(null);
    setBookingMessage('');

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingStatus('error');
      setBookingMessage('Please select check-in and check-out dates.');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setBookingStatus('error');
      setBookingMessage('Check-out date must be after check-in date.');
      return;
    }

    setBookingLoading(true);

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing._id,
          startDate: checkIn,
          endDate: checkOut,
          guestsCount: guests,
          totalPrice: totalCost
        })
      });

      const data = await res.json();

      if (res.ok) {
        setBookingStatus('success');
        setBookingMessage('Your reservation request has been submitted successfully! Check status in My Trips.');
        setCheckIn('');
        setCheckOut('');
        setGuests(1);
      } else {
        setBookingStatus('error');
        setBookingMessage(data.message || 'Failed to request reservation.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingStatus('error');
      setBookingMessage('Server error during reservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  const isHostOfListing = user && listing.host && (listing.host._id ? listing.host._id.toString() : listing.host.toString()) === user._id.toString();

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <button className="listing-back-btn" onClick={() => setView('home')}>
        <ArrowLeft size={16} />
        <span>Back to listings</span>
      </button>

      {/* Title Header */}
      <div className="info-header">
        <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{listing.title}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Star size={14} fill="var(--warning)" className="rating-star" />
              <span>{listing.rating.toFixed(1)}</span>
              <span style={{ color: 'var(--gray-text)', fontWeight: 400 }}>({listing.reviewsCount} reviews)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gray-text)' }}>
              <MapPin size={14} />
              <span>{listing.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="gallery-grid">
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
          alt={listing.title}
          className="gallery-main"
        />
        <div className="gallery-thumbs">
          <img
            src={listing.images[1] || 'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?auto=format&fit=crop&w=800&q=80'}
            alt="Interior view"
            className="gallery-thumb"
          />
        </div>
      </div>

      {/* Main Detail Grid Layout */}
      <div className="listing-detail-layout">
        {/* Left column: Property description and amenities */}
        <div>
          {/* Host info banner */}
          <div className="host-info-card">
            <div className="host-avatar">
              {(listing.host?.name || 'H').charAt(0).toUpperCase()}
            </div>
            <div className="host-meta">
              <h4>Hosted by {listing.host?.name || 'Independent Owner'}</h4>
              <p>Host role verified • Professional hospitality partner</p>
            </div>
          </div>

          {/* Configuration details */}
          <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-gray)', display: 'flex', gap: '20px', fontSize: '15px', color: 'var(--gray-text)' }}>
            <strong>{listing.maxGuests} guests</strong>
            <span>•</span>
            <strong>{listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''}</strong>
            <span>•</span>
            <strong>{listing.beds} bed{listing.beds > 1 ? 's' : ''}</strong>
            <span>•</span>
            <strong>{listing.bathrooms} bathroom{listing.bathrooms > 1 ? 's' : ''}</strong>
          </div>

          {/* Description */}
          <div className="listing-description">
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>About this stay</h3>
            <p>{listing.description}</p>
          </div>

          {/* Amenities checklist */}
          <div className="amenities-section">
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>What this place offers</h3>
            <div className="amenities-grid">
              {listing.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  <Check size={16} color="var(--success)" strokeWidth={2.5} />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Interactive Booking Card Widget */}
        <div>
          <div className="booking-card">
            <div className="booking-header">
              <div>
                <span className="booking-price">${listing.price}</span>
                <span style={{ color: 'var(--gray-text)', fontSize: '14px' }}> / night</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                <Star size={13} fill="var(--warning)" className="rating-star" />
                <span>{listing.rating.toFixed(1)}</span>
              </div>
            </div>

            <form onSubmit={handleBooking}>
              <div className="booking-form-box">
                <div className="booking-dates-row">
                  <div className="date-box">
                    <label htmlFor="booking-checkin">Check-in</label>
                    <input
                      id="booking-checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                    />
                  </div>
                  <div className="date-box">
                    <label htmlFor="booking-checkout">Check-out</label>
                    <input
                      id="booking-checkout"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="guests-box">
                  <label htmlFor="booking-guests">Guests</label>
                  <select
                    id="booking-guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    {[...Array(listing.maxGuests || 1).keys()].map(i => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} guest{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status responses */}
              {bookingStatus && (
                <div 
                  className="notification-banner" 
                  style={{ 
                    borderLeftColor: bookingStatus === 'success' ? 'var(--success)' : 'var(--danger)', 
                    background: bookingStatus === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)', 
                    color: bookingStatus === 'success' ? 'var(--success)' : 'var(--danger)',
                    padding: '10px 14px',
                    fontSize: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <span>{bookingMessage}</span>
                </div>
              )}

              {/* Price calculation summary */}
              {nights > 0 && (
                <div className="price-breakdown">
                  <div className="breakdown-row">
                    <span>${listing.price} x {nights} nights</span>
                    <span>${baseCost}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>TravelNest guest service fee (8%)</span>
                    <span>${serviceFee}</span>
                  </div>
                  <div className="breakdown-row total">
                    <span>Total stay price</span>
                    <span>${totalCost}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '16px' }}
                disabled={bookingLoading || isHostOfListing}
              >
                {bookingLoading ? 'Processing Request...' : 
                 isHostOfListing ? 'You Own This Listing' : 
                 user ? 'Reserve Stay' : 'Sign In to Book'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-gray)', paddingTop: '32px' }}>
          <Star size={18} fill="var(--dark)" />
          <span>{listing.rating.toFixed(1)} • {reviews.length} reviews</span>
        </h3>

        {reviews.length === 0 ? (
          <div style={{ color: 'var(--gray-text)', padding: '24px 0', fontSize: '14px' }}>
            No reviews yet for this listing. Be the first to leave a review after your reservation!
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((rev) => (
              <div key={rev._id} className="review-item">
                <div className="review-user-row">
                  <div className="host-avatar" style={{ width: '36px', height: '36px', fontSize: '13px', background: 'var(--dark)' }}>
                    {(rev.user?.name || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div className="review-user-info">
                    <h5>{rev.user?.name || 'Verified Traveler'}</h5>
                    <span className="review-date">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                </div>

                <div className="review-rating" style={{ marginBottom: '8px' }}>
                  {[...Array(5).keys()].map(i => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < rev.rating ? 'var(--warning)' : 'none'}
                      color={i < rev.rating ? 'var(--warning)' : '#CCCCCC'}
                    />
                  ))}
                </div>

                <p className="review-comment">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
