import React, { useState, useEffect } from 'react';
import '../styles/admin-dashboard.css';
import WatchModal from './WatchModal';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, X, Search, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  // State
  const [activeTab, setActiveTab] = useState('watches');
  const [watches, setWatches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWatch, setCurrentWatch] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnectionFailed, setApiConnectionFailed] = useState(false);

  // Fetch watches and brands from API on component mount
  useEffect(() => {
    // Flag to prevent state updates if component unmounts during API call
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setError(null);

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted && isLoading) {
          setError('Request timed out. The server may be unavailable.');
          setIsLoading(false);
          setApiConnectionFailed(true);
        }
      }, 15000); // 15 second timeout

      try {
        // Fetch both watches and brands in parallel
        const [watchesData, brandsData] = await Promise.all([
          api.watches.getAll().catch((err) => {
            console.error('Error fetching watches:', err);
            throw err;
          }),
          api.brands.getAll().catch((err) => {
            console.error('Error fetching brands:', err);
            throw err;
          }),
        ]);

        // Clear timeout as request succeeded
        clearTimeout(timeoutId);

        if (!isMounted) return;

        // Check if the data is valid
        if (!Array.isArray(watchesData) || !Array.isArray(brandsData)) {
          console.error('Invalid data format:', { watchesData, brandsData });
          throw new Error('Invalid data format received from server');
        }

        // Create a map of brand IDs to brand objects for quick lookup
        const brandMap = {};
        brandsData.forEach((brand) => {
          if (brand && brand._id) {
            brandMap[brand._id] = brand;
          }
        });

        // Ensure watches have populated brand information
        const processedWatches = watchesData
          .map((watch) => {
            if (!watch) return null;

            // If brand is just an ID string but we have the brand info
            if (typeof watch.brand === 'string' && brandMap[watch.brand]) {
              return {
                ...watch,
                brand: {
                  _id: watch.brand,
                  brand_name: brandMap[watch.brand].brand_name,
                },
              };
            }
            return watch;
          })
          .filter(Boolean); // Remove null values

        if (isMounted) {
          setBrands(brandsData);
          setWatches(processedWatches);
          setApiConnectionFailed(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);

        if (isMounted) {
          console.error('Error in fetchData:', err);
          setError(`Failed to fetch data: ${err.message || 'Unknown error'}`);
          setApiConnectionFailed(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler for saving watch data (both add and edit)
  const handleSaveWatch = async (watchData, mode) => {
    if (!watchData) {
      setError('No watch data provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError('Request timed out. The server may be unavailable.');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    try {
      if (mode === 'add') {
        // Add new watch via API
        const newWatch = await api.watches.create(watchData);

        // Clear timeout as request succeeded
        clearTimeout(timeoutId);

        if (!newWatch || typeof newWatch !== 'object') {
          throw new Error('Invalid response when creating watch');
        }

        // Ensure the brand information is populated properly
        const brandInfo = brands.find((b) => b._id === newWatch.brand);
        const processedNewWatch = {
          ...newWatch,
          brand: brandInfo
            ? {
                _id: newWatch.brand,
                brand_name: brandInfo.brand_name,
              }
            : newWatch.brand,
        };

        setWatches([...watches, processedNewWatch]);
      } else if (mode === 'edit' && currentWatch) {
        // Edit existing watch via API
        const updatedWatch = await api.watches.update(
          currentWatch._id,
          watchData
        );

        // Clear timeout as request succeeded
        clearTimeout(timeoutId);

        if (!updatedWatch || typeof updatedWatch !== 'object') {
          throw new Error('Invalid response when updating watch');
        }

        // Ensure the brand information is populated properly
        const brandInfo = brands.find((b) => b._id === updatedWatch.brand);
        const processedUpdatedWatch = {
          ...updatedWatch,
          brand: brandInfo
            ? {
                _id: updatedWatch.brand,
                brand_name: brandInfo.brand_name,
              }
            : updatedWatch.brand,
        };

        setWatches(
          watches.map((watch) =>
            watch._id === currentWatch._id ? processedUpdatedWatch : watch
          )
        );
      } else {
        clearTimeout(timeoutId);
        throw new Error('Invalid mode or missing watch data');
      }

      // Close modal after successful save
      setIsModalOpen(false);
      setCurrentWatch(null);
    } catch (err) {
      clearTimeout(timeoutId);

      console.error('Error saving watch:', err);
      setError(
        `Failed to ${mode === 'add' ? 'create' : 'update'} watch: ${err.message || 'Unknown error'}`
      );
      // We don't close the modal so the user can try again
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for opening edit modal
  const handleEditWatch = (watch) => {
    if (!watch) return;

    setCurrentWatch(watch);
    setIsModalOpen(true);
  };

  // Handler for delete confirmation
  const handleDeleteClick = (watch) => {
    if (!watch) return;

    setConfirmDelete(watch);
  };

  // Handler for confirming deletion
  const handleConfirmDelete = async () => {
    if (!confirmDelete || !confirmDelete._id) {
      setError('Invalid watch selected for deletion');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError('Request timed out. The server may be unavailable.');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    try {
      // Delete watch via API
      await api.watches.delete(confirmDelete._id);

      // Clear timeout as request succeeded
      clearTimeout(timeoutId);

      setWatches(watches.filter((watch) => watch._id !== confirmDelete._id));
      setConfirmDelete(null);
    } catch (err) {
      clearTimeout(timeoutId);

      console.error('Error deleting watch:', err);
      setError(`Failed to delete watch: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for canceling deletion
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Function to get brand name from a watch
  const getBrandName = (watch) => {
    if (!watch) return 'Unknown Brand';

    // If brand is a populated object with brand_name
    if (
      watch.brand &&
      typeof watch.brand === 'object' &&
      watch.brand.brand_name
    ) {
      return watch.brand.brand_name;
    }

    // If brand is just an ID, try to find it in our brands list
    if (watch.brand && typeof watch.brand === 'string') {
      const brandInfo = brands.find((b) => b._id === watch.brand);
      if (brandInfo) {
        return brandInfo.brand_name;
      }
    }

    // Default fallback
    return 'Unknown Brand';
  };

  // If API connection completely failed, show a simplified view
  if (apiConnectionFailed) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-container">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <div className="api-error-message">
            <AlertCircle size={24} />
            <div>
              <h3>Connection Error</h3>
              <p>
                {error ||
                  'Failed to connect to the server. Please try again later.'}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TabContent = () => {
    switch (activeTab) {
      case 'watches':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Watch Management</h2>
              <button
                className="btn btn-primary btn-add"
                onClick={() => {
                  setCurrentWatch(null);
                  setIsModalOpen(true);
                }}
                disabled={isLoading}
              >
                <Plus size={18} /> Add Watch
              </button>
            </div>

            {error && (
              <div className="error-message">
                {error}
                <button
                  className="btn-close-error"
                  onClick={() => setError(null)}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {isLoading && <div className="loading">Loading...</div>}

            <div className="data-container">
              {watches.length === 0 && !isLoading ? (
                <div className="empty-state">
                  <p>No watches found.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Add your first watch
                  </button>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Model</th>
                      <th>Year</th>
                      <th>Price/Day</th>
                      <th>Condition</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watches.map((watch) => (
                      <tr key={watch._id}>
                        <td>{getBrandName(watch)}</td>
                        <td>{watch.model}</td>
                        <td>{watch.year}</td>
                        <td>${watch.rental_day_price}</td>
                        <td>{watch.condition}</td>
                        <td>{watch.quantity}</td>
                        <td className="actions">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEditWatch(watch)}
                            disabled={isLoading}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteClick(watch)}
                            disabled={isLoading}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Payment Management</h2>
              <div className="filters">
                <select className="filter-select">
                  <option>All Status</option>
                  <option>Paid</option>
                  <option>Unpaid</option>
                </select>
              </div>
            </div>
            <div className="data-container">
              <table>
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Rental ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PAY001</td>
                    <td>RENT001</td>
                    <td>$600</td>
                    <td>
                      <span className="status-badge status-pending">
                        Pending
                      </span>
                    </td>
                    <td>2024-02-14</td>
                    <td className="actions">
                      <button className="btn btn-small btn-success">
                        Paid
                      </button>
                      <button className="btn btn-small btn-danger">
                        Unpaid
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>PAY002</td>
                    <td>RENT002</td>
                    <td>$450</td>
                    <td>
                      <span className="status-badge status-success">Paid</span>
                    </td>
                    <td>2024-02-15</td>
                    <td className="actions">
                      <button className="btn btn-small btn-success disabled">
                        Paid
                      </button>
                      <button className="btn btn-small btn-danger">
                        Unpaid
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>User Management</h2>
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="search-input"
                />
              </div>
            </div>
            <div className="data-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Doe</td>
                    <td>john@example.com</td>
                    <td>0412345678</td>
                    <td>123 Main St, Sydney</td>
                    <td className="actions">
                      <button className="btn-icon btn-edit">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>Jane Smith</td>
                    <td>jane@example.com</td>
                    <td>0498765432</td>
                    <td>456 Park Ave, Melbourne</td>
                    <td className="actions">
                      <button className="btn-icon btn-edit">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="dashboard-content">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-menu">
              <button
                onClick={() => setActiveTab('watches')}
                className={`sidebar-item ${activeTab === 'watches' ? 'active' : ''}`}
              >
                Watch Management
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`sidebar-item ${activeTab === 'payments' ? 'active' : ''}`}
              >
                Payment Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
              >
                User Management
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <TabContent />
          </div>
        </div>
      </div>

      {/* Watch Modal */}
      {isModalOpen && (
        <WatchModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentWatch(null);
          }}
          watch={currentWatch}
          onSave={handleSaveWatch}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="btn-close" onClick={handleCancelDelete}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete the{' '}
                {getBrandName(confirmDelete)} {confirmDelete.model}?
              </p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
