import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Clock, Edit, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import { useAuthData } from '../hooks/useAuthData';
import '../styles/user-profile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { authData } = useAuthData();
  const [isLoading, setIsLoading] = useState(true);
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState(null);
  const [showEditPersonal, setShowEditPersonal] = useState(false);
  const [showEditAddress, setShowEditAddress] = useState(false);

  // Form state for editing
  const [personalForm, setPersonalForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  const [addressForm, setAddressForm] = useState({
    street_address: '',
    suburb: '',
    state: '',
    postcode: '',
  });

  useEffect(() => {
    // Check if user is logged in
    if (!authData.isAuthenticated) {
      navigate('/login?redirect=/account/profile');
      return;
    }

    // Set initial form data from auth data
    setPersonalForm({
      first_name: authData.user.first_name || '',
      last_name: authData.user.last_name || '',
      email: authData.user.email || '',
      phone_number: authData.user.phone_number || '',
    });

    setAddressForm({
      street_address: authData.user.street_address || '',
      suburb: authData.user.suburb || '',
      state: authData.user.state || '',
      postcode: authData.user.postcode || '',
    });

    // Fetch recent rentals
    const fetchRecentRentals = async () => {
      setIsLoading(true);

      try {
        // Fetch user's rentals (in a real app, we would have an API endpoint for recent rentals)
        const rentalsData = await api.rentals.getUserRentals();

        // Sort by start date, most recent first
        const sortedRentals = rentalsData.sort(
          (a, b) =>
            new Date(b.rental_start_date) - new Date(a.rental_start_date)
        );

        // Take only the most recent 5 rentals
        const recentRentals = sortedRentals.slice(0, 5);
        setRentals(recentRentals);
      } catch (err) {
        console.error('Error fetching rental history:', err);
        setError('Failed to load your rental history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentRentals();
  }, [authData, navigate]);

  // Handle form input changes
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm({
      ...personalForm,
      [name]: value,
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: value,
    });
  };

  // Handle form submissions
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();

    try {
      // In a real app, this would update the user profile in the backend
      await api.users.updateProfile(personalForm);
      setShowEditPersonal(false);

      // Update local auth data (this would typically be handled by a context update)
      // For now, we'll just show a success message
      alert('Personal information updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update personal information');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    try {
      // In a real app, this would update the user address in the backend
      await api.users.updateAddress(addressForm);
      setShowEditAddress(false);

      // Show success message
      alert('Address updated successfully');
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Failed to update address');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determine current vs past rentals
  const currentRentals = rentals.filter((rental) => {
    const today = new Date();
    const endDate = new Date(rental.rental_end_date);
    return (
      endDate >= today &&
      rental.rental_status !== 'Cancelled' &&
      rental.rental_status !== 'Returned'
    );
  });

  const pastRentals = rentals.filter((rental) => {
    const today = new Date();
    const endDate = new Date(rental.rental_end_date);
    return (
      endDate < today ||
      rental.rental_status === 'Cancelled' ||
      rental.rental_status === 'Returned'
    );
  });

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Returned':
        return 'status-returned';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  if (!authData.isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="not-authenticated">
          <h2>Please log in to view your profile</h2>
          <Link to="/login" className="login-link">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="close-error" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      <div className="profile-grid">
        {/* Personal Information */}
        <div className="profile-column">
          <div className="profile-card">
            <div className="card-header">
              <div className="header-title">
                <User className="header-icon" />
                <h2>Personal Information</h2>
              </div>
              <button
                className="edit-button"
                onClick={() => setShowEditPersonal(!showEditPersonal)}
              >
                <Edit size={18} className="edit-icon" />
                {showEditPersonal ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {showEditPersonal ? (
              <form className="edit-form" onSubmit={handlePersonalSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={personalForm.first_name}
                      onChange={handlePersonalChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={personalForm.last_name}
                      onChange={handlePersonalChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={personalForm.email}
                      onChange={handlePersonalChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone_number">Phone</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={personalForm.phone_number}
                      onChange={handlePersonalChange}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>First Name</label>
                  <div>{authData.user.first_name || 'Not provided'}</div>
                </div>
                <div className="info-item">
                  <label>Last Name</label>
                  <div>{authData.user.last_name || 'Not provided'}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div>{authData.user.email || 'Not provided'}</div>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <div>{authData.user.phone_number || 'Not provided'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Address Information */}
          <div className="profile-card">
            <div className="card-header">
              <div className="header-title">
                <MapPin className="header-icon" />
                <h2>Address</h2>
              </div>
              <button
                className="edit-button"
                onClick={() => setShowEditAddress(!showEditAddress)}
              >
                <Edit size={18} className="edit-icon" />
                {showEditAddress ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {showEditAddress ? (
              <form className="edit-form" onSubmit={handleAddressSubmit}>
                <div className="form-group">
                  <label htmlFor="street_address">Street Address</label>
                  <input
                    type="text"
                    id="street_address"
                    name="street_address"
                    value={addressForm.street_address}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="suburb">Suburb</label>
                  <input
                    type="text"
                    id="suburb"
                    name="suburb"
                    value={addressForm.suburb}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <select
                      id="state"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                    >
                      <option value="">Select State</option>
                      <option value="NSW">NSW</option>
                      <option value="VIC">VIC</option>
                      <option value="QLD">QLD</option>
                      <option value="WA">WA</option>
                      <option value="SA">SA</option>
                      <option value="TAS">TAS</option>
                      <option value="ACT">ACT</option>
                      <option value="NT">NT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="postcode">Postcode</label>
                    <input
                      type="text"
                      id="postcode"
                      name="postcode"
                      value={addressForm.postcode}
                      onChange={handleAddressChange}
                      maxLength="4"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="address-info">
                <div className="info-item">
                  <label>Street Address</label>
                  <div>{authData.user.street_address || 'Not provided'}</div>
                </div>
                <div className="info-item">
                  <label>Suburb</label>
                  <div>{authData.user.suburb || 'Not provided'}</div>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>State</label>
                    <div>{authData.user.state || 'Not provided'}</div>
                  </div>
                  <div className="info-item">
                    <label>Postcode</label>
                    <div>{authData.user.postcode || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rental History */}
        <div className="rental-column">
          <div className="profile-card">
            <div className="card-header">
              <div className="header-title">
                <Clock className="header-icon" />
                <h2>Rental History</h2>
              </div>
              <Link to="/account/rentals" className="view-all-link">
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="loading-message">Loading rental history...</div>
            ) : (
              <>
                {/* Current Rentals */}
                <div className="rental-section">
                  <h3 className="section-title">Current Rentals</h3>

                  {currentRentals.length === 0 ? (
                    <div className="empty-message">No active rentals</div>
                  ) : (
                    currentRentals.map((rental, index) => (
                      <div key={index} className="rental-item">
                        <div className="rental-details">
                          <div className="rental-title">
                            {rental.watch?.brand?.brand_name || ''}{' '}
                            {rental.watch?.model || 'Watch'}
                          </div>
                          <div className="rental-dates">
                            Start: {formatDate(rental.rental_start_date)}
                          </div>
                          <div className="rental-dates">
                            End: {formatDate(rental.rental_end_date)}
                          </div>
                        </div>
                        <div
                          className={`rental-status ${getStatusClass(rental.rental_status)}`}
                        >
                          {rental.rental_status}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Past Rentals */}
                <div className="rental-section">
                  <h3 className="section-title">Past Rentals</h3>

                  {pastRentals.length === 0 ? (
                    <div className="empty-message">No past rentals</div>
                  ) : (
                    pastRentals.slice(0, 3).map((rental, index) => (
                      <div key={index} className="rental-item">
                        <div className="rental-details">
                          <div className="rental-title">
                            {rental.watch?.brand?.brand_name || ''}{' '}
                            {rental.watch?.model || 'Watch'}
                          </div>
                          <div className="rental-dates">
                            {formatDate(rental.rental_start_date)} -{' '}
                            {formatDate(rental.rental_end_date)}
                          </div>
                        </div>
                        <div
                          className={`rental-status ${getStatusClass(rental.rental_status)}`}
                        >
                          {rental.rental_status}
                        </div>
                      </div>
                    ))
                  )}

                  {pastRentals.length > 3 && (
                    <Link to="/account/rentals" className="view-more-link">
                      View more past rentals
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
