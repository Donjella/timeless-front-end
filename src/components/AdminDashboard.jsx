import React, { useState, useEffect } from 'react';
import '../styles/admin-dashboard.css';
import WatchModal from './WatchModal';
import { api } from '../utils/api';

// Simple icon components instead of using lucide-react
const Icons = {
  Plus: () => <span className="icon">+</span>,
  Edit: () => <span className="icon">✎</span>,
  Trash: () => <span className="icon">🗑</span>,
  Close: () => <span className="icon">×</span>,
  Search: () => <span className="icon">🔍</span>
};

const AdminDashboard = () => {
  // State
  const [activeTab, setActiveTab] = useState('watches');
  const [watches, setWatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWatch, setCurrentWatch] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch watches from API on component mount
  useEffect(() => {
    const fetchWatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.watches.getAll();
        setWatches(data);
      } catch (err) {
        setError(`Failed to fetch watches: ${err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatches();
  }, []);

  // Handler for saving watch data (both add and edit)
  const handleSaveWatch = async (watchData, mode) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (mode === 'add') {
        // Add new watch via API
        const newWatch = await api.watches.create(watchData);
        setWatches([...watches, newWatch]);
      } else {
        // Edit existing watch via API
        const updatedWatch = await api.watches.update(currentWatch._id, watchData);
        setWatches(watches.map(watch => 
          watch._id === currentWatch._id ? updatedWatch : watch
        ));
      }
      // Close modal after successful save
      setIsModalOpen(false);
      setCurrentWatch(null);
    } catch (err) {
      setError(`Failed to ${mode === 'add' ? 'create' : 'update'} watch: ${err.message}`);
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
        setWatches(watches.filter(watch => watch._id !== confirmDelete._id));
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

  const TabContent = () => {
    switch(activeTab) {
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
                <Icons.Plus /> Add Watch
              </button>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
                <button 
                  className="btn-close-error" 
                  onClick={() => setError(null)}
                >
                  <Icons.Close />
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
                    {watches.map(watch => (
                      <tr key={watch._id}>
                        <td>{watch.brand && watch.brand.brand_name ? watch.brand.brand_name : 'Unknown Brand'}</td>
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
                            <Icons.Edit />
                          </button>
                          <button 
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteClick(watch)}
                            disabled={isLoading}
                          >
                            <Icons.Trash />
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
                    <td><span className="status-badge status-pending">Pending</span></td>
                    <td>2024-02-14</td>
                    <td className="actions">
                      <button className="btn btn-small btn-success">Paid</button>
                      <button className="btn btn-small btn-danger">Unpaid</button>
                    </td>
                  </tr>
                  <tr>
                    <td>PAY002</td>
                    <td>RENT002</td>
                    <td>$450</td>
                    <td><span className="status-badge status-success">Paid</span></td>
                    <td>2024-02-15</td>
                    <td className="actions">
                      <button className="btn btn-small btn-success disabled">Paid</button>
                      <button className="btn btn-small btn-danger">Unpaid</button>
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
                <Icons.Search className="search-icon" />
                <input type="text" placeholder="Search users..." className="search-input" />
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
                      <button className="btn-icon btn-edit"><Icons.Edit /></button>
                    </td>
                  </tr>
                  <tr>
                    <td>Jane Smith</td>
                    <td>jane@example.com</td>
                    <td>0498765432</td>
                    <td>456 Park Ave, Melbourne</td>
                    <td className="actions">
                      <button className="btn-icon btn-edit"><Icons.Edit /></button>
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
                <Icons.Close />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete the {confirmDelete.brand?.brand_name || 'Unknown'} {confirmDelete.model}?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCancelDelete}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;