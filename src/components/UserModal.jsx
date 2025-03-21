import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { api } from '../utils/api';

const UserModal = ({ isOpen, onClose, user = null, onSave }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (user) {
      // Populate form with existing user data
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
      });
    } else {
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'user',
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
    if (!formData.name || !formData.email) {
      setError('Name and Email are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Update existing user
        if (formData.role !== user.role) {
          // Update user role separately if changed
          await api.users.updateRole(user._id, formData.role);
        }
        await api.users.updateProfile(formData);
      } else {
        // Create new user
        await api.auth.register(formData);
      }

      // Call onSave callback
      onSave(formData, user ? 'edit' : 'add');

      // Close modal
      onClose();
    } catch (err) {
      setError(api.utils.formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        className="modal-container user-modal"
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #eaeaea',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            className="btn-close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="modal-form"
          style={{ padding: '20px' }}
        >
          {error && (
            <div
              className="error-text"
              style={{
                color: '#e53935',
                marginBottom: '16px',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#555',
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#555',
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={!!user}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: !!user ? '#f5f5f5' : '#fff',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label
              htmlFor="phone"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#555',
              }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label
              htmlFor="role"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#555',
              }}
            >
              User Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div
            className="modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                borderRadius: '4px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: 'none',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                borderRadius: '4px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                opacity: isLoading ? 0.6 : 1,
              }}
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
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default UserModal;
