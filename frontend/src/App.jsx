import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Dashboard from './pages/Dashboard';
import './index.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('home');
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Callback storage to let Navbar open the "Add Property" modal inside Dashboard
  const [addListingHandler, setAddListingHandler] = useState(null);

  const registerAddListingCallback = (callback) => {
    setAddListingHandler(() => callback);
  };

  const handleAddListingOpen = () => {
    setView('dashboard');
    if (addListingHandler) {
      // Delay slightly to allow the dashboard component to mount and tab state to switch
      setTimeout(() => {
        addListingHandler();
      }, 50);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setView('home'); // Reset view to home to display search results
  };

  if (loading) {
    return (
      <div className="spinner-container" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Dynamic Navbar */}
      <Navbar
        setView={setView}
        onSearch={handleSearch}
        onOpenAuth={() => setAuthModalOpen(true)}
        onAddListingOpen={handleAddListingOpen}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {view === 'home' && (
          <Home
            searchQuery={searchQuery}
            setView={setView}
            setSelectedListingId={setSelectedListingId}
          />
        )}

        {view === 'detail' && (
          <ListingDetail
            listingId={selectedListingId}
            setView={setView}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {view === 'dashboard' && user && (
          <Dashboard
            viewTrigger={view}
            onAddListingRegister={registerAddListingCallback}
          />
        )}

        {view === 'dashboard' && !user && (
          <div className="empty-state">
            <h3>Please Sign In</h3>
            <p style={{ marginTop: '8px' }}>You must be logged in to view your dashboard.</p>
            <button 
              className="btn-signin" 
              style={{ marginTop: '16px' }}
              onClick={() => setAuthModalOpen(true)}
            >
              Sign In
            </button>
          </div>
        )}
      </main>

      {/* Pop-up Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
