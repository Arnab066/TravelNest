import React, { useState, useEffect } from 'react';
import { API_BASE } from '../context/AuthContext';
import { Globe, Waves, Warehouse, Flame, Trees, Gem, Star, MapPin } from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Globe },
  { name: 'Beachfront', icon: Waves },
  { name: 'Cabins', icon: Warehouse },
  { name: 'Trending', icon: Flame },
  { name: 'Treehouses', icon: Trees },
  { name: 'Luxury', icon: Gem }
];

export default function Home({ searchQuery, setView, setSelectedListingId }) {
  const [listings, setListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE}/listings`;
        const params = [];
        if (activeCategory !== 'All') {
          params.push(`category=${encodeURIComponent(activeCategory)}`);
        }
        if (searchQuery) {
          params.push(`location=${encodeURIComponent(searchQuery)}`);
        }
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [activeCategory, searchQuery]);

  const handleCardClick = (id) => {
    setSelectedListingId(id);
    setView('detail');
  };

  return (
    <div>
      {/* Category Bar */}
      <div className="categories-bar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.name}
              className={`category-item ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              <Icon size={20} />
              <span className="category-label">{cat.name}</span>
            </div>
          );
        })}
      </div>

      {searchQuery && (
        <div style={{ marginBottom: '16px', fontSize: '15px', color: 'var(--gray-text)' }}>
          Showing stays in <strong style={{ color: 'var(--dark)' }}>"{searchQuery}"</strong>
        </div>
      )}

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <Globe size={48} />
          <h3>No properties found</h3>
          <p style={{ marginTop: '8px' }}>Try adjusting your filters or location search query.</p>
        </div>
      ) : (
        <div className="grid-listings">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="property-card"
              onClick={() => handleCardClick(listing._id)}
            >
              <div className="card-img-wrapper">
                <img
                  src={listing.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                  alt={listing.title}
                  className="card-img"
                  loading="lazy"
                />
                <span className="card-tag">{listing.category}</span>
              </div>
              
              <div className="card-content">
                <div className="card-header-row">
                  <h4 className="card-title">{listing.title}</h4>
                  <div className="card-rating">
                    <Star size={13} fill="var(--warning)" className="rating-star" />
                    <span>{listing.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="card-location">
                  <MapPin size={12} style={{ marginRight: '4px', display: 'inline' }} />
                  {listing.location}
                </div>

                <div className="card-details">
                  {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''} • {listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''} • Up to {listing.maxGuests} guests
                </div>

                <div className="card-price-row">
                  <span className="card-price">${listing.price}</span>
                  <span className="card-price-label">/ night</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
