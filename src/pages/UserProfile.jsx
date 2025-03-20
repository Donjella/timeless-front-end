// basic structure for imports and components

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '../hooks/useAuthData';
import { api } from '../utils/api';




export function UserProfile (){

    // declarations for state variable / hooks

    const navigate = useNavigate();


    const { authData } = useAuthData;


    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState('');

    const [userProfile, setUserProfile] = useState(null);

    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({

    });

    // auth check , redirects to login if not authenticated
    useEffect(() => {
        if (!authData.isAuthenticated) {
            navigate('/login');
        }
    }, [authData.isAuthenticated, navigate]);

    // fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!authData.isAuthenticated) return;
            
            setIsLoading(true);
            try{
                const userData = await api.auth.getProfile();
                setUserProfile(userData);

                // set form data with user profile info
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone_number: userData.phone_number || '',
                    street_address: userData.street_address || '',
                    suburb: userData.suburb || '',
                    state: userData.state || '',
                    postcode: userData.postcode || '',
                });
            } catch (error) {
                console.error('Problem retrieving user profile:', error);
                setError('We failed to load your profile. Please try again or contact support.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }), [authData.isAuthenticated];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);

        // if cancelling edit, reset form data
        if (isEditing && userProfile) {
            setFormData({
                first_name: userProfile.first_name || '',
                last_name: userProfile.last_name || '',
                email: userProfile.email || '',
                phone_number: userProfile.phone_number || '',
                street_address: userProfile.street_address || '',
                suburb: userProfile.suburb || '',
                state: userProfile.state || '',
                postcode: userProfile.postcode || '',
            });
        }
    }; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setIsLoading(true);
            const updatedUserData = await api.auth.updateProfile(formData);
            setUserProfile(updatedUserData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(
                error.message || 'We encountered an error updating your profile. Please try again or contact support.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="container" role="main">
          <article className="profile-page">
            <header>
              <h1 className="page-title">Your Profile</h1>
              {error && (
                <p className="error-message" role="alert" aria-live="assertive">
                  {error}
                </p>
              )}
            </header>
    
            {!isEditing ? (
              // normal view , without form
              <div className="profile-info">
                <section className="profile-section" aria-labelledby="personal-info-heading">
                  <h2 id="personal-info-heading" className="section-title">Personal Information</h2>
                  <dl className="info-grid">
                    <div className="info-item">
                      <dt className="info-label">Name:</dt>
                      <dd className="info-value">
                        {userProfile?.first_name} {userProfile?.last_name}
                      </dd>
                    </div>
                    <div className="info-item">
                      <dt className="info-label">Email:</dt>
                      <dd className="info-value">{userProfile?.email}</dd>
                    </div>
                    <div className="info-item">
                      <dt className="info-label">Phone:</dt>
                      <dd className="info-value">
                        {userProfile?.phone_number || 'Not provided'}
                      </dd>
                    </div>
                  </dl>
                </section>
    
                <section className="profile-section" aria-labelledby="address-info-heading">
                  <h2 id="address-info-heading" className="section-title">Address Information</h2>
                  <dl className="info-grid">
                    <div className="info-item">
                      <dt className="info-label">Street:</dt>
                      <dd className="info-value">
                        {userProfile?.street_address || 'Not provided'}
                      </dd>
                    </div>
                    <div className="info-item">
                      <dt className="info-label">Suburb:</dt>
                      <dd className="info-value">
                        {userProfile?.suburb || 'Not provided'}
                      </dd>
                    </div>
                    <div className="info-item">
                      <dt className="info-label">State:</dt>
                      <dd className="info-value">
                        {userProfile?.state || 'Not provided'}
                      </dd>
                    </div>
                    <div className="info-item">
                      <dt className="info-label">Postcode:</dt>
                      <dd className="info-value">
                        {userProfile?.postcode || 'Not provided'}
                      </dd>
                    </div>
                  </dl>
                </section>
    
                <footer className="profile-actions">
                  <button 
                    className="btn edit-profile-btn" 
                    onClick={handleEditToggle}
                    aria-label="Edit profile information"
                  >
                    Edit Profile
                  </button>
                </footer>
              </div>
            ) : (
              // form interface showing, for editing
              <form onSubmit={handleSubmit} className="profile-form" aria-labelledby="edit-profile-heading">
                <h2 id="edit-profile-heading" className="visually-hidden">Edit Your Profile</h2>
                
                <div className="form-grid">
                  <fieldset className="form-section">
                    <legend className="section-title">Personal Information</legend>
    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="first_name">First Name</label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          aria-required="true"
                        />
                      </div>
    
                      <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          aria-required="true"
                        />
                      </div>
                    </div>
    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled
                          aria-readonly="true"
                        />
                        <small id="email-help" className="form-text">Email cannot be changed.</small>
                      </div>
    
                      <div className="form-group">
                        <label htmlFor="phone_number">Phone Number</label>
                        <input
                          type="tel"
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </fieldset>
    
                  <fieldset className="form-section">
                    <legend className="section-title">Address Information</legend>
    
                    <div className="form-group full-width">
                      <label htmlFor="street_address">Street Address</label>
                      <input
                        type="text"
                        id="street_address"
                        name="street_address"
                        value={formData.street_address}
                        onChange={handleChange}
                      />
                    </div>
    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="suburb">Suburb</label>
                        <input
                          type="text"
                          id="suburb"
                          name="suburb"
                          value={formData.suburb}
                          onChange={handleChange}
                        />
                      </div>
    
                      <div className="form-group">
                        <label htmlFor="state">State</label>
                        <select
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                        >
                          <option value="">Select State</option>
                          <option value="NSW">New South Wales</option>
                          <option value="VIC">Victoria</option>
                          <option value="QLD">Queensland</option>
                          <option value="WA">Western Australia</option>
                          <option value="SA">South Australia</option>
                          <option value="TAS">Tasmania</option>
                          <option value="ACT">Australian Capital Territory</option>
                          <option value="NT">Northern Territory</option>
                        </select>
                      </div>
    
                      <div className="form-group">
                        <label htmlFor="postcode">Postcode</label>
                        <input
                          type="text"
                          id="postcode"
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleChange}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          maxLength="4"
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
    
                <footer className="form-actions">
                  <button
                    type="button"
                    className="btn cancel-btn"
                    onClick={handleEditToggle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn save-btn"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </footer>
              </form>
            )}
          </article>
        </main>
      );

}

export default UserProfile;