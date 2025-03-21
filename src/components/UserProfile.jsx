import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Clock,
  Package,
  Edit,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuthData } from '../hooks/useAuthData';
import UserRentals from './UserRentals';
import '../styles/user-profile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { authData } = useAuthData();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Check if user is logged in
    if (!authData.isAuthenticated) {
      navigate('/login?redirect=/account/profile');
      return;
    }

    // Fetch user's profile data
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if authentication is valid
        if (!api.auth.isAuthenticated()) {
          // Token expired or missing, redirect to login
          navigate('/login?redirect=/account/profile&message=expired');
          return;
        }

        const profile = await api.auth.getProfile();
        setProfileData(profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        if (err.status === 401) {
          // Unauthorized - token likely expired
          localStorage.removeItem('auth');
          navigate('/login?redirect=/account/profile&message=expired');
          return;
        }
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [authData, navigate]);

  if (isLoading) {
    return <div className="loading-container">Loading your profile...</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <h1>My Account</h1>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-error">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('rentals')}
          >
            Rentals
          </button>
        </div>

        {activeTab === 'profile' && profileData && (
          <div className="profile-content">
            <div className="profile-section personal-info">
              <div className="section-header">
                <div className="section-title">
                  <User className="icon" />
                  <h2>Personal Information</h2>
                </div>
                <button
                  className="edit-button"
                  onClick={() => navigate('/account/edit-profile')}
                >
                  <Edit size={18} className="icon" /> Edit
                </button>
              </div>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>First Name</label>
                  <div className="field-value">{profileData.first_name}</div>
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <div className="field-value">{profileData.last_name}</div>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <div className="field-value">{profileData.email}</div>
                </div>
                <div className="profile-field">
                  <label>Phone</label>
                  <div className="field-value">{profileData.phone_number}</div>
                </div>
              </div>
            </div>

            <div className="profile-section address-info">
              <div className="section-header">
                <div className="section-title">
                  <MapPin className="icon" />
                  <h2>Address</h2>
                </div>
                <button
                  className="edit-button"
                  onClick={() => navigate('/account/edit-profile')}
                >
                  <Edit size={18} className="icon" /> Edit
                </button>
              </div>
              <div className="address-fields">
                <div className="profile-field">
                  <label>Street Address</label>
                  <div className="field-value">
                    {profileData.address?.street_address || 'Not provided'}
                  </div>
                </div>
                <div className="profile-field">
                  <label>Suburb</label>
                  <div className="field-value">
                    {profileData.address?.suburb || 'Not provided'}
                  </div>
                </div>
                <div className="address-grid">
                  <div className="profile-field">
                    <label>State</label>
                    <div className="field-value">
                      {profileData.address?.state || 'Not provided'}
                    </div>
                  </div>
                  <div className="profile-field">
                    <label>Postcode</label>
                    <div className="field-value">
                      {profileData.address?.postcode || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section rental-summary">
              <div className="section-header">
                <div className="section-title">
                  <Clock className="icon" />
                  <h2>Rental Overview</h2>
                </div>
                <button
                  className="view-all-button"
                  onClick={() => setActiveTab('rentals')}
                >
                  View All
                </button>
              </div>
              <div className="rental-summary-content">
                {/* This will be a simplified version of the rentals list */}
                <p>
                  Click "View All" to see your complete rental history and
                  manage your rentals.
                </p>
                <button
                  className="browse-watches-button"
                  onClick={() => navigate('/catalog')}
                >
                  Browse Watches
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rentals' && (
          <div className="rentals-tab-content">
            <UserRentals />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
