import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { LayoutDashboard, Briefcase, Plus, Star, Calendar, MapPin, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function Dashboard({ viewTrigger, onAddListingRegister }) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === 'host' ? 'listings' : 'trips');
  const [bookings, setBookings] = useState([]);
  const [hostListings, setHostListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Create Listing Modal (nested for Host)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState('Cabins');
  const [newMaxGuests, setNewMaxGuests] = useState(2);
  const [newBedrooms, setNewBedrooms] = useState(1);
  const [newBeds, setNewBeds] = useState(1);
  const [newBathrooms, setNewBathrooms] = useState(1);
  const [newImage, setNewImage] = useState('');
  const [addError, setAddError] = useState('');

  // Edit Listing state
  const [editListingId, setEditListingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Expose trigger to open creation modal from navbar
  useEffect(() => {
    if (onAddListingRegister) {
      onAddListingRegister(() => {
        setActiveTab('listings');
        setAddModalOpen(true);
      });
    }
  }, [onAddListingRegister]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      const bookingsRes = await fetch(`${API_BASE}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      // Fetch host listings if role is host
      if (user?.role === 'host') {
        const listingsRes = await fetch(`${API_BASE}/listings`);
        if (listingsRes.ok) {
          const allListings = await listingsRes.json();
          // Filter listings owned by this host
          const filtered = allListings.filter(l => {
            const hostId = l.host?._id ? l.host._id.toString() : l.host?.toString();
            return hostId === user._id.toString();
          });
          setHostListings(filtered);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Refetch bookings to reflect change
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!newTitle || !newDescription || !newPrice || !newLocation) {
      setAddError('Please complete all required fields.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          price: Number(newPrice),
          location: newLocation,
          category: newCategory,
          maxGuests: Number(newMaxGuests),
          bedrooms: Number(newBedrooms),
          beds: Number(newBeds),
          bathrooms: Number(newBathrooms),
          images: newImage ? [newImage] : []
        })
      });

      if (res.ok) {
        setAddModalOpen(false);
        // Reset form
        setNewTitle('');
        setNewDescription('');
        setNewPrice('');
        setNewLocation('');
        setNewCategory('Cabins');
        setNewMaxGuests(2);
        setNewBedrooms(1);
        setNewBeds(1);
        setNewBathrooms(1);
        setNewImage('');
        fetchData();
      } else {
        const data = await res.json();
        setAddError(data.message || 'Failed to create listing');
      }
    } catch (err) {
      console.error('Create listing error:', err);
      setAddError('Server error creating listing.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this property? This will remove all associated bookings.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete listing.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    setReviewSuccess('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!reviewComment) {
      setReviewError('Review description cannot be empty.');
      return;
    }

    const listingId = selectedBookingForReview?.listing?._id || selectedBookingForReview?.listing;

    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId,
          rating: Number(reviewRating),
          comment: reviewComment
        })
      });

      const data = await res.json();

      if (res.ok) {
        setReviewSuccess('Thank you! Your review was submitted successfully.');
        setTimeout(() => {
          setReviewModalOpen(false);
        }, 1500);
      } else {
        setReviewError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Review submit error:', err);
      setReviewError('Server error submitting review.');
    }
  };

  return (
    <div className="dashboard-layout" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Sidebar Control Panel */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-heading">Travelnest Dashboard</div>
        <ul className="sidebar-menu">
          {user?.role === 'host' && (
            <>
              <li 
                className={`sidebar-item ${activeTab === 'listings' ? 'active' : ''}`}
                onClick={() => setActiveTab('listings')}
              >
                <LayoutDashboard size={16} />
                <span>My Listings</span>
              </li>
              <li 
                className={`sidebar-item ${activeTab === 'reservations' ? 'active' : ''}`}
                onClick={() => setActiveTab('reservations')}
              >
                <RefreshCw size={16} />
                <span>Reservations Received</span>
              </li>
            </>
          )}
          <li 
            className={`sidebar-item ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            <Briefcase size={16} />
            <span>My Bookings / Trips</span>
          </li>
        </ul>
      </aside>

      {/* Main Panel Content */}
      <main className="dashboard-content-card">
        {activeTab === 'listings' && user?.role === 'host' && (
          <div>
            <div className="dashboard-title-row">
              <h3>Manage Your Properties</h3>
              <button className="btn-signin" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setAddModalOpen(true)}>
                <Plus size={16} />
                <span>Add Property</span>
              </button>
            </div>

            {loading ? (
              <div className="spinner-container"><div className="spinner"></div></div>
            ) : hostListings.length === 0 ? (
              <div className="empty-state">
                <LayoutDashboard size={40} />
                <h4>No listings added yet</h4>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>Click the button above to add your first property listing.</p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Property details</th>
                      <th>Location</th>
                      <th>Price per night</th>
                      <th>Rating score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostListings.map(listing => (
                      <tr key={listing._id}>
                        <td>
                          <div className="table-listing-item">
                            <img 
                              src={listing.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80'} 
                              alt={listing.title} 
                              className="table-listing-img"
                            />
                            <div>
                              <strong style={{ fontSize: '14px' }}>{listing.title}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--gray-text)', marginTop: '2px' }}>{listing.category}</div>
                            </div>
                          </div>
                        </td>
                        <td>{listing.location}</td>
                        <td><strong>${listing.price}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={12} fill="var(--warning)" color="var(--warning)" />
                            <span>{listing.rating.toFixed(1)} ({listing.reviewsCount} reviews)</span>
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn-action-danger" 
                            onClick={() => handleDeleteListing(listing._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && user?.role === 'host' && (
          <div>
            <div className="dashboard-title-row">
              <h3>Reservations Received</h3>
            </div>

            {loading ? (
              <div className="spinner-container"><div className="spinner"></div></div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <Calendar size={40} />
                <h4>No booking requests yet</h4>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>When guests request reservations at your listings, they will appear here.</p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Guest Details</th>
                      <th>Listing Property</th>
                      <th>Check-in / Check-out</th>
                      <th>Total Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => {
                      const guestName = booking.guest?.name || 'Guest Traveler';
                      const guestEmail = booking.guest?.email || '';
                      const listingTitle = booking.listing?.title || 'Property listing';
                      
                      return (
                        <tr key={booking._id}>
                          <td>
                            <div>
                              <strong>{guestName}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--gray-text)' }}>{guestEmail}</div>
                            </div>
                          </td>
                          <td>{listingTitle}</td>
                          <td>
                            <div style={{ fontSize: '13px' }}>
                              <div>In: {new Date(booking.startDate).toLocaleDateString()}</div>
                              <div>Out: {new Date(booking.endDate).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td><strong>${booking.totalPrice}</strong></td>
                          <td>
                            <span className={`status-badge ${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            {booking.status === 'pending' && (
                              <div style={{ display: 'flex' }}>
                                <button 
                                  className="btn-action-success"
                                  onClick={() => handleBookingAction(booking._id, 'confirmed')}
                                >
                                  Accept
                                </button>
                                <button 
                                  className="btn-action-danger"
                                  onClick={() => handleBookingAction(booking._id, 'rejected')}
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            {booking.status === 'confirmed' && (
                              <button 
                                className="btn-action-danger"
                                onClick={() => handleBookingAction(booking._id, 'cancelled')}
                              >
                                Cancel
                              </button>
                            )}
                            {['rejected', 'cancelled'].includes(booking.status) && (
                              <span style={{ color: 'var(--gray-text)', fontSize: '12px' }}>Archived</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trips' && (
          <div>
            <div className="dashboard-title-row">
              <h3>My Stays & Trips</h3>
            </div>

            {loading ? (
              <div className="spinner-container"><div className="spinner"></div></div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={40} />
                <h4>No trips booked yet</h4>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>Start browsing properties and book your next stay on TravelNest!</p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Property Name</th>
                      <th>Travel Dates</th>
                      <th>Guest Count</th>
                      <th>Total paid</th>
                      <th>Booking Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => {
                      const title = booking.listing?.title || 'Vacation Home';
                      const loc = booking.listing?.location || '';
                      
                      return (
                        <tr key={booking._id}>
                          <td>
                            <div>
                              <strong>{title}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--gray-text)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                <MapPin size={10} /> {loc}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '13px' }}>
                              <div>In: {new Date(booking.startDate).toLocaleDateString()}</div>
                              <div>Out: {new Date(booking.endDate).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td>{booking.guestsCount} guests</td>
                          <td><strong>${booking.totalPrice}</strong></td>
                          <td>
                            <span className={`status-badge ${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            {booking.status === 'confirmed' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="btn-action-success"
                                  onClick={() => handleOpenReviewModal(booking)}
                                >
                                  Leave Review
                                </button>
                                <button 
                                  className="btn-action-danger"
                                  onClick={() => handleBookingAction(booking._id, 'cancelled')}
                                >
                                  Cancel Trip
                                </button>
                              </div>
                            )}
                            {booking.status === 'pending' && (
                              <button 
                                className="btn-action-danger"
                                onClick={() => handleBookingAction(booking._id, 'cancelled')}
                              >
                                Cancel Request
                              </button>
                            )}
                            {['rejected', 'cancelled'].includes(booking.status) && (
                              <span style={{ color: 'var(--gray-text)', fontSize: '12px' }}>Archived</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* RENDER MODAL: CREATE PROPERTY (HOST ONLY) */}
      {addModalOpen && (
        <div className="modal-overlay" onClick={() => setAddModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="modal-close-btn" onClick={() => setAddModalOpen(false)} aria-label="Close modal">
              <XCircle size={16} />
            </button>
            <h3 className="modal-title">List your property on TravelNest</h3>

            {addError && (
              <div className="notification-banner" style={{ borderLeftColor: 'var(--danger)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateListing}>
              <div className="form-group">
                <label className="form-label" htmlFor="prop-title">Listing Name / Title</label>
                <input 
                  id="prop-title"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Sunny Oceanfront Cottage"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prop-desc">Property Description</label>
                <textarea 
                  id="prop-desc"
                  className="form-textarea" 
                  placeholder="Describe your property, amenities, nearby attractions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-price">Price per night ($)</label>
                  <input 
                    id="prop-price"
                    type="number" 
                    className="form-input" 
                    placeholder="120"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-loc">Location (City, Country)</label>
                  <input 
                    id="prop-loc"
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Miami, USA"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-category">Category classification</label>
                  <select 
                    id="prop-category"
                    className="form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Cabins">Cabins</option>
                    <option value="Beachfront">Beachfront</option>
                    <option value="Trending">Trending</option>
                    <option value="Treehouses">Treehouses</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prop-img">Cover Photo URL (optional)</label>
                  <input 
                    id="prop-img"
                    type="text" 
                    className="form-input" 
                    placeholder="Unsplash image URL link"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="prop-guests" style={{ fontSize: '11px' }}>Max Guests</label>
                  <input 
                    id="prop-guests"
                    type="number" 
                    className="form-input" 
                    value={newMaxGuests}
                    onChange={(e) => setNewMaxGuests(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="prop-beds" style={{ fontSize: '11px' }}>Beds count</label>
                  <input 
                    id="prop-beds"
                    type="number" 
                    className="form-input" 
                    value={newBeds}
                    onChange={(e) => setNewBeds(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="prop-bedrooms" style={{ fontSize: '11px' }}>Bedrooms</label>
                  <input 
                    id="prop-bedrooms"
                    type="number" 
                    className="form-input" 
                    value={newBedrooms}
                    onChange={(e) => setNewBedrooms(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="prop-baths" style={{ fontSize: '11px' }}>Bathrooms</label>
                  <input 
                    id="prop-baths"
                    type="number" 
                    className="form-input" 
                    value={newBathrooms}
                    onChange={(e) => setNewBathrooms(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">Create Property Listing</button>
            </form>
          </div>
        </div>
      )}

      {/* RENDER MODAL: LEAVE A STAY REVIEW (GUEST ONLY) */}
      {reviewModalOpen && (
        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setReviewModalOpen(false)} aria-label="Close modal">
              <XCircle size={16} />
            </button>
            <h3 className="modal-title">Write stay feedback</h3>

            {reviewError && (
              <div className="notification-banner" style={{ borderLeftColor: 'var(--danger)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <span>{reviewError}</span>
              </div>
            )}

            {reviewSuccess && (
              <div className="notification-banner" style={{ borderLeftColor: 'var(--success)', background: 'var(--success-bg)', color: 'var(--success)' }}>
                <span>{reviewSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label className="form-label" htmlFor="review-score">Rating score (1 to 5 stars)</label>
                <select 
                  id="review-score"
                  className="form-select"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Below expectations)</option>
                  <option value={1}>⭐ (1 - Unsatisfactory)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="review-desc">Your Review Description</label>
                <textarea 
                  id="review-desc"
                  className="form-textarea" 
                  placeholder="Share details of your stay: what was great, location tips, host interaction..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">Submit Stay Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
