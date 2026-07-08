import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Search, Menu, LogOut, LayoutDashboard, Briefcase, PlusCircle } from 'lucide-react';

export default function Navbar({ setView, onSearch, onOpenAuth, onAddListingOpen }) {
  const { user, logout } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const handleLogoClick = () => {
    setView('home');
    setSearchVal('');
    onSearch('');
  };

  return (
    <nav className="navbar">
      {/* Brand Logo */}
      <div className="nav-brand" onClick={handleLogoClick}>
        <Compass size={28} color="var(--primary)" strokeWidth={2.5} />
        <span className="logo-text">travelnest</span>
      </div>

      {/* Search Bar */}
      <form className="nav-search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by location..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
        <button type="submit" className="search-icon-btn" aria-label="Search listings">
          <Search size={15} />
        </button>
      </form>

      {/* User Actions */}
      <div className="nav-actions">
        {user ? (
          <>
            {user.role === 'host' && (
              <button 
                className="host-switch-btn"
                style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={onAddListingOpen}
              >
                <PlusCircle size={16} />
                <span>List a Property</span>
              </button>
            )}

            <div style={{ position: 'relative' }}>
              <button 
                className="user-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Toggle user profile menu"
              >
                <Menu size={16} color="var(--gray-text)" />
                <div className="avatar-circle">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {dropdownOpen && (
                <div 
                  className="modal-container"
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: '0',
                    width: '240px',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: '150',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                  onClick={() => setDropdownOpen(false)}
                >
                  <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-gray)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    <div style={{ 
                      fontSize: '10px', 
                      background: user.role === 'host' ? 'var(--primary-light)' : 'var(--success-bg)', 
                      color: user.role === 'host' ? 'var(--primary)' : 'var(--success)',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      width: 'fit-content',
                      marginTop: '6px',
                      textTransform: 'uppercase'
                    }}>
                      {user.role}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {user.role === 'host' ? (
                      <button 
                        className="sidebar-item" 
                        style={{ padding: '8px', fontSize: '13px' }}
                        onClick={() => setView('dashboard')}
                      >
                        <LayoutDashboard size={14} />
                        <span>Host Dashboard</span>
                      </button>
                    ) : (
                      <button 
                        className="sidebar-item" 
                        style={{ padding: '8px', fontSize: '13px' }}
                        onClick={() => setView('dashboard')}
                      >
                        <Briefcase size={14} />
                        <span>My Trips</span>
                      </button>
                    )}

                    <button 
                      className="sidebar-item" 
                      style={{ padding: '8px', fontSize: '13px', color: 'var(--danger)', marginTop: '4px' }}
                      onClick={logout}
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className="btn-signin" onClick={onOpenAuth}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
