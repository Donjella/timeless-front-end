import React, { useState, useEffect } from 'react';
import '../styles/watch-modal.css';
import { api } from '../utils/api';

// Simple Close icon component
const CloseIcon = () => <span className="icon">×</span>;

const WatchModal = ({ isOpen, onClose, watch = null, onSave }) => {
  const [formData, setFormData] = useState({
    brand_id: '',
    model: '',
    year: new Date().getFullYear(),
    rental_day_price: '',
    condition: 'Good',
    quantity: 5,
  });
  
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Valid condition options from backend
  const validConditions = ['New', 'Excellent', 'Good', 'Fair', 'Poor'];

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const brandsData = await api.brands.getAll();
        setBrands(brandsData);
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
      setFormData({
        brand_id: watch.brand && watch.brand._id ? watch.brand._id : watch.brand,
        model: watch.model || '',
        year: watch.year || new Date().getFullYear(),
        rental_day_price: watch.rental_day_price || '',
        condition: watch.condition || 'Good',
        quantity: watch.quantity || 5,
      });
    } else {
      // Reset form for add mode
      setFormData({
        brand_id: brands.length > 0 ? brands[0]._id : '',
        model: '',
        year: new Date().getFullYear(),
        rental_day_price: '',
        condition: 'Good',
        quantity: 5,
      });
    }
  }, [watch, isOpen, brands]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'rental_day_price' || name === 'quantity' 
        ? Number(value) 
        : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, watch ? 'edit' : 'add');
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
            ) : (
              <select
                id="brand_id"
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a brand</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.brand_name}
                  </option>
                ))}
              </select>
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
              {validConditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {watch ? 'Update Watch' : 'Add Watch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WatchModal;