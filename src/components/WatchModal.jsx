import React, { useState, useEffect } from 'react';
import { Filter as FilterIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import WatchModal from './WatchModal';
import { getImagePlaceholder } from '../utils/imageUtils';
import '../styles/watch-catalog.css';

const WatchCatalog = () => {
  const navigate = useNavigate();
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWatch, setCurrentWatch] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilters, setBrandFilters] = useState({});
  const [priceValue, setPriceValue] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150);
  const [conditionFilter, setConditionFilter] = useState('Any');
  
  // Brand list for filters
  const [brands, setBrands] = useState([]);
  
  // Authentication state
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      setIsAdmin(auth.user?.role === 'admin');
    };
    
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    
    return () => {
      window.removeEventListener('storage', checkAdmin);
    };
  }, []);

  // Fetch watches and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [watchesData, brandsData] = await Promise.all([
          api.watches.getAll(),
          api.brands.getAll()
        ]);
        
        setWatches(watchesData);
        setBrands(brandsData);
        
        // Initialize brand filters
        const initialBrandFilters = {};
        brandsData.forEach(brand => {
          initialBrandFilters[brand._id] = false;
        });
        setBrandFilters(initialBrandFilters);
        
        // Find max price for range input
        if (watchesData.length > 0) {
          const highestPrice = Math.max(...watchesData.map(w => w.rental_day_price));
          setMaxPrice(highestPrice);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load watches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle watch creation or update
  const handleSaveWatch = async (watchData, mode) => {
    try {
      let updatedWatch;
      
      if (mode === 'edit' && currentWatch) {
        updatedWatch = await api.watches.update(currentWatch._id, watchData);
        
        // Update watches list
        setWatches(watches.map(w => 
          w._id === updatedWatch._id ? updatedWatch : w
        ));
      } else {
        updatedWatch = await api.watches.create(watchData);
        
        // Add to watches list
        setWatches([...watches, updatedWatch]);
      }
      
      setIsModalOpen(false);
      setCurrentWatch(null);
    } catch (err) {
      console.error('Error saving watch:', err);
      setError(err.message || 'Failed to save watch. Please try again.');
    }
  };

  // Handle rental action
  const handleRent = (watch) => {
    // Check if user is logged in
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      // Redirect to login page
      navigate('/login?redirect=/rent?watch=' + watch._id);
      return;
    }
    
    // Navigate to rental page with watch ID
    navigate('/rent?watch=' + watch._id);
  };

  // Filter watches based on filters
  const filteredWatches = watches.filter(watch => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      watch.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (watch.brand.brand_name && watch.brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Brand filter - if no brands are selected, show all
    const anyBrandSelected = Object.values(brandFilters).some(selected => selected);
    const matchesBrand = !anyBrandSelected || brandFilters[watch.brand._id];
    
    // Price range filter
    const matchesPrice = priceValue === 0 || watch.rental_day_price >= priceValue;
    
    // Condition filter
    const matchesCondition = conditionFilter === 'Any' || watch.condition === conditionFilter;
    
    return matchesSearch && matchesBrand && matchesPrice && matchesCondition;
  });

  // Toggle brand filter
  const toggleBrandFilter = (brandId) => {
    setBrandFilters({
      ...brandFilters,
      [brandId]: !brandFilters[brandId]
    });
  };

  // View watch details
  const viewDetails = (watch) => {
    setSelectedWatch(watch);
    // You could navigate to a details page instead:
    // navigate(`/watches/${watch._id}`);
  };

  return (
    <div className="watch-catalog-container">
      <h1>Watch Catalog</h1>
      
      <div className="search-row">
        <div className="search-box">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search watches..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isAdmin && (
          <button 
            className="add-watch-btn"
            onClick={() => {
              setCurrentWatch(null);
              setIsModalOpen(true);
            }}
          >
            Add New Watch
          </button>
        )}
      </div>
      
      <div className="catalog-layout">
        <div className="filters-sidebar">
          <div className="filter-header">
            <FilterIcon size={16} />
            <h3>Filters</h3>
          </div>
          
          <div className="filter-section">
            <h4>Brand</h4>
            <div className="brand-options">
              {brands.map(brand => (
                <div key={brand._id} className="brand-option">
                  <input 
                    type="checkbox" 
                    id={`brand-${brand._id}`}
                    checked={brandFilters[brand._id] || false}
                    onChange={() => toggleBrandFilter(brand._id)}
                  />
                  <label htmlFor={`brand-${brand._id}`}>{brand.brand_name}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Price Range</h4>
            <input 
              type="range" 
              min="0" 
              max={maxPrice}
              value={priceValue}
              onChange={(e) => setPriceValue(parseInt(e.target.value))}
              className="price-slider"
            />
            <div className="price-labels">
              <span>$0</span>
              <span>${priceValue}</span>
              <span>${maxPrice}</span>
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Condition</h4>
            <select 
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="condition-select"
            >
              <option value="Any">Any</option>
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
        
        <div className="watches-content">
          {loading ? (
            <div className="loading-message">Loading watches...</div>
          ) : filteredWatches.length === 0 ? (
            <div className="no-results-message">
              <p>No watches found matching your criteria.</p>
            </div>
          ) : (
            <div className="watches-list">
              {filteredWatches.map(watch => (
                <div key={watch._id} className="watch-card">
                  <div className="watch-image">
                    <img 
                      src={watch.image_url || getImagePlaceholder()} 
                      alt={`${watch.brand.brand_name} ${watch.model}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getImagePlaceholder();
                      }}
                    />
                  </div>
                  <div className="watch-info">
                    <h3>{watch.brand.brand_name} {watch.model}</h3>
                    <p className="watch-price">${watch.rental_day_price}/day</p>
                    <button 
                      className="view-details-btn"
                      onClick={() => viewDetails(watch)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Watch details modal or custom component */}
      {selectedWatch && (
        <div className="watch-details-modal">
          <div className="modal-content">
            <button 
              className="close-modal"
              onClick={() => setSelectedWatch(null)}
            >
              ×
            </button>
            <div className="watch-details">
              <div className="watch-details-image">
                <img 
                  src={selectedWatch.image_url || getImagePlaceholder()} 
                  alt={`${selectedWatch.brand.brand_name} ${selectedWatch.model}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getImagePlaceholder();
                  }}
                />
              </div>
              <div className="watch-details-info">
                <h2>{selectedWatch.brand.brand_name} {selectedWatch.model}</h2>
                <p><strong>Year:</strong> {selectedWatch.year}</p>
                <p><strong>Condition:</strong> {selectedWatch.condition}</p>
                <p><strong>Price:</strong> ${selectedWatch.rental_day_price}/day</p>
                <p><strong>Available:</strong> {selectedWatch.quantity} {selectedWatch.quantity === 1 ? 'unit' : 'units'}</p>
                
                <div className="watch-actions">
                  <button 
                    className="rent-btn"
                    onClick={() => handleRent(selectedWatch)}
                    disabled={selectedWatch.quantity < 1}
                  >
                    {selectedWatch.quantity < 1 ? 'Out of Stock' : 'Rent Now'}
                  </button>
                  
                  {isAdmin && (
                    <div className="admin-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => {
                          setCurrentWatch(selectedWatch);
                          setIsModalOpen(true);
                          setSelectedWatch(null);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete ${selectedWatch.brand.brand_name} ${selectedWatch.model}?`)) {
                            try {
                              await api.watches.delete(selectedWatch._id);
                              setWatches(watches.filter(w => w._id !== selectedWatch._id));
                              setSelectedWatch(null);
                            } catch (err) {
                              console.error('Error deleting watch:', err);
                              setError(err.message || 'Failed to delete watch');
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Watch Modal for adding/editing */}
      <WatchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentWatch(null);
        }}
        watch={currentWatch}
        onSave={handleSaveWatch}
      />
    </div>
  );
};

export default WatchCatalog;