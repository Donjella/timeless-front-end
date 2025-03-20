import React, { useState, useEffect } from 'react';
import '../styles/watch-modal.css';
import { api } from '../utils/api';
import { Upload, X } from 'lucide-react';

// Simple icon components
const CloseIcon = () => <span className="icon">×</span>;
const PlusIcon = () => <span className="icon">+</span>;

const WatchModal = ({ isOpen, onClose, watch = null, onSave }) => {
  const [formData, setFormData] = useState({
    brand_id: '', // Using brand_id as required by the controller
    model: '',
    year: new Date().getFullYear(),
    rental_day_price: '',
    condition: 'Good',
    quantity: 5,
    image_url: '', // Added for image URL support
  });

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [brandError, setBrandError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Valid condition options from backend
  const validConditions = ['New', 'Excellent', 'Good', 'Fair', 'Poor'];

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const brandsData = await api.brands.getAll();
        setBrands(brandsData);

        // If no brand is selected and brands exist, select the first one
        if (!formData.brand_id && brandsData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            brand_id: brandsData[0]._id,
          }));
        }
      } catch (err) {
        setError('Failed to load brands. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchBrands();
    }
  }, [isOpen]);

  useEffect(() => {
    if (watch) {
      // If watch is provided, we're in edit mode
      // For edit mode, map the brand field back to brand_id
      setFormData({
        brand_id:
          watch.brand && watch.brand._id ? watch.brand._id : watch.brand,
        model: watch.model || '',
        year: watch.year || new Date().getFullYear(),
        rental_day_price: watch.rental_day_price || '',
        condition: watch.condition || 'Good',
        quantity: watch.quantity || 5,
        image_url: watch.image_url || '',
      });
      
      // Set image preview if there's an image URL
      if (watch.image_url) {
        setImagePreview(watch.image_url);
      } else {
        setImagePreview(null);
      }
    } else if (brands.length > 0) {
      // Reset form for add mode - ensure brand_id is set
      setFormData({
        brand_id: brands[0]._id,
        model: '',
        year: new Date().getFullYear(),
        rental_day_price: '',
        condition: 'Good',
        quantity: 5,
        image_url: '',
      });
      setImagePreview(null);
    }
  }, [watch, isOpen, brands]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For numeric fields, convert to proper numbers (handle the 0150 vs 150 issue)
    if (name === 'year' || name === 'rental_day_price' || name === 'quantity') {
      // Convert to number - this removes leading zeros
      const numericValue = Number(value);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Handle image URL change separately to update preview
      if (name === 'image_url') {
        setImagePreview(value);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure brand_id is set
    if (!formData.brand_id && brands.length > 0) {
      setFormData({
        ...formData,
        brand_id: brands[0]._id,
      });
    }

    // Check for required fields
    if (!formData.brand_id) {
      setError('Please select a brand or add a new one');
      return;
    }

    // Convert numeric strings to actual numbers to avoid issues
    const processedData = {
      ...formData,
      year: Number(formData.year),
      rental_day_price: Number(formData.rental_day_price),
      quantity: Number(formData.quantity),
    };

    // Submit the form
    onSave(processedData, watch ? 'edit' : 'add');
  };

  const toggleAddBrand = () => {
    setIsAddingBrand(!isAddingBrand);
    setNewBrandName('');
    setBrandError(null);
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      setBrandError('Brand name cannot be empty');
      return;
    }

    setLoading(true);
    setBrandError(null);

    try {
      const newBrand = await api.brands.create({
        brand_name: newBrandName.trim(),
      });
      setBrands([...brands, newBrand]);

      // Select the newly created brand
      setFormData({
        ...formData,
        brand_id: newBrand._id,
      });

      // Reset new brand form
      setNewBrandName('');
      setIsAddingBrand(false);
    } catch (err) {
      setBrandError(err.message || 'Failed to create brand. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // A helper function to handle image preview errors
  const handleImageError = () => {
    setImagePreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{watch ? 'Edit Watch' : 'Add New Watch'}</h2>
          <button className="btn-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {error && (
          <div className="modal-error">
            {error}
            <button onClick={() => setError(null)} className="btn-close-error">
              <CloseIcon />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="brand_id">Brand</label>
            {loading ? (
              <div className="loading-indicator">Loading brands...</div>
            ) : isAddingBrand ? (
              <div className="new-brand-container">
                <input
                  type="text"
                  id="new_brand_name"
                  placeholder="Enter new brand name"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className={brandError ? 'error' : ''}
                />
                <div className="brand-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={toggleAddBrand}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAddBrand}
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>
                {brandError && <div className="error-text">{brandError}</div>}
              </div>
            ) : (
              <div className="select-with-button">
                <select
                  id="brand_id"
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  required
                  disabled={brands.length === 0}
                >
                  {brands.length === 0 ? (
                    <option value="">No brands available</option>
                  ) : (
                    brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.brand_name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={toggleAddBrand}
                  title="Add new brand"
                >
                  <PlusIcon />
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rental_day_price">Price/Day ($)</label>
              <input
                type="number"
                id="rental_day_price"
                name="rental_day_price"
                value={formData.rental_day_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              {validConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL input */}
          <div className="form-group">
            <label htmlFor="image_url">Image URL</label>
            <div className="image-input-container">
              <input
                type="text"
                id="image_url"
                name="image_url"
                placeholder="https://example.com/watch-image.jpg"
                value={formData.image_url}
                onChange={handleChange}
              />
              <div className="image-preview-container">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Watch preview"
                    className="image-preview"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="image-placeholder">
                    <Upload size={24} />
                    <span>No image</span>
                  </div>
                )}
              </div>
            </div>
            <p className="help-text">
              Enter a URL for the watch image. For production, you would implement file upload functionality.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (brands.length === 0 && !isAddingBrand)}
            >
              {watch ? 'Update Watch' : 'Add Watch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WatchModal;