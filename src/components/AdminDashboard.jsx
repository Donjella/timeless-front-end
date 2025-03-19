import React, { useState, useEffect } from 'react';
import '../styles/admin-dashboard.css';
import WatchModal from './WatchModal';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';

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

  // Fetch watches and brands from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch both watches and brands in parallel
        const [watchesData, brandsData] = await Promise.all([
          api.watches.getAll(),
          api.brands.getAll(),
        ]);

        console.log('Fetched watches:', watchesData);
        console.log('Fetched brands:', brandsData);

        // Create a map of brand IDs to brand objects for quick lookup
        const brandMap = {};
        brandsData.forEach((brand) => {
          brandMap[brand._id] = brand;
        });

        // Ensure watches have populated brand information
        const processedWatches = watchesData.map((watch) => {
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
        });

        setBrands(brandsData);
        setWatches(processedWatches);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler for saving watch data (both add and edit)
  const handleSaveWatch = async (watchData, mode) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'add') {
        // Add new watch via API
        const newWatch = await api.watches.create(watchData);
        console.log('Created new watch:', newWatch);

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
      } else {
        // Edit existing watch via API
        const updatedWatch = await api.watches.update(
          currentWatch._id,
          watchData
        );
        console.log('Updated watch:', updatedWatch);

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
      }
      // Close modal after successful save
      setIsModalOpen(false);
      setCurrentWatch(null);
    } catch (err) {
      setError(
        `Failed to ${mode === 'add' ? 'create' : 'update'} watch: ${err.message}`
      );
      console.error(err);
      // We don't close the modal so the user can try again
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for opening edit modal
  const handleEditWatch = (watch) => {
    setCurrentWatch(watch);
    setIsModalOpen(true);
  };

  // Handler for delete confirmation
  const handleDeleteClick = (watch) => {
    setConfirmDelete(watch);
  };

  // Handler for confirming deletion
  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      setIsLoading(true);
      setError(null);

      try {
        // Delete watch via API
        await api.watches.delete(confirmDelete._id);
        setWatches(watches.filter((watch) => watch._id !== confirmDelete._id));
        setConfirmDelete(null);
      } catch (err) {
        setError(`Failed to delete watch: ${err.message}`);
        console.error(err);
        // We don't clear confirmDelete so user can try again
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handler for canceling deletion
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Function to get brand name from a watch
  const getBrandName = (watch) => {
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
      <WatchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentWatch(null);
        }}
        watch={currentWatch}
        onSave={handleSaveWatch}
      />

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