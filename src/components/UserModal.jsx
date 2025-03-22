import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { api } from '../utils/api';

const UserModal = ({ isOpen, onClose, user = null, onSave }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'user',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (user) {
      // Populate form with existing user data
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        role: user.role || 'user',
      });
    } else {
      // Reset form for new user
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: 'user',
        // Only include password for new users
        password: '',
      });
    }
    // Clear any previous errors
    setError(null);
  }, [user, isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('First name, last name, and email are required');
      return;
    }

    // For new users, ensure password is provided
    if (!user && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a copy of formData to avoid modifying the original
      const dataToSubmit = { ...formData };

      // Don't send password for updates
      if (user) {
        delete dataToSubmit.password;
      }

      if (user) {
        // 1. First, update the role if it changed (using the specific endpoint)
        if (formData.role !== user.role) {
          try {
            await api.users.updateRole(user._id, formData.role);
            console.log('Role updated successfully');
          } catch (roleErr) {
            console.error('Error updating role:', roleErr);
          }
        }

        // 2. Update user profile (use PATCH method to updateUserProfile)
        try {
          // Only send fields that can be updated in profile
          const profileData = {
            first_name: dataToSubmit.first_name,
            last_name: dataToSubmit.last_name,
            phone_number: dataToSubmit.phone_number,
          };

          await api.users.updateProfile(profileData);
          console.log('Submitting profileData:', profileData);
          console.log('Profile updated successfully');
        } catch (profileErr) {
          console.error('Error updating profile:', profileErr);
          throw profileErr; // Rethrow to be caught by outer catch
        }
      } else {
        // For new users, use registration endpoint with all fields
        await api.auth.register(dataToSubmit);
      }

      // Construct updated user data for UI refresh
      const updatedUserData = user
        ? {
            ...user,
            first_name: dataToSubmit.first_name,
            last_name: dataToSubmit.last_name,
            phone_number: dataToSubmit.phone_number,
            role: dataToSubmit.role,
          }
        : dataToSubmit;

      // Call onSave callback to update UI
      onSave(updatedUserData, user ? 'edit' : 'add');
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);

      // Improve error handling
      let errorMessage = 'An error occurred while saving the user';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (err.status === 400) {
        errorMessage = 'Invalid data provided. Please check your inputs.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container user-modal">
        <div className="modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-text">{error}</div>}

          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
              required
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
              placeholder="Last Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              disabled={!!user}
              className={user ? 'disabled' : ''}
            />
          </div>

          {!user && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder="Password (minimum 6 characters)"
                required={!user}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">User Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : user ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add PropTypes validation
UserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default UserModal;
