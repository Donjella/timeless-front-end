import React, { useState, useEffect, useRef } from 'react';
import '../styles/admin-dashboard.css';
import WatchModal from './WatchModal';
import UserModal from './UserModal';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, X, Search, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('watches');
  const [watches, setWatches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [users, setUsers] = useState([]);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [currentWatch, setCurrentWatch] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnectionFailed, setApiConnectionFailed] = useState(false);

  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Create a ref for the search input
  const searchInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setError(null);

      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setError('Request timed out. The server may be unavailable.');
          setIsLoading(false);
          setApiConnectionFailed(true);
        }
      }, 15000);

      try {
        const [watchesData, brandsData, usersData] = await Promise.all([
          api.watches.getAll().catch((err) => {
            console.error('Error fetching watches:', err);
            throw err;
          }),
          api.brands.getAll().catch((err) => {
            console.error('Error fetching brands:', err);
            throw err;
          }),
          api.users.getAll().catch((err) => {
            console.error('Error fetching users:', err);
            throw err;
          }),
        ]);

        clearTimeout(timeoutId);

        if (!isMounted) return;

        if (
          !Array.isArray(watchesData) ||
          !Array.isArray(brandsData) ||
          !Array.isArray(usersData)
        ) {
          console.error('Invalid data format:', {
            watchesData,
            brandsData,
            usersData,
          });
          throw new Error('Invalid data format received from server');
        }

        const brandMap = {};
        brandsData.forEach((brand) => {
          if (brand && brand._id) {
            brandMap[brand._id] = brand;
          }
        });

        const processedWatches = watchesData
          .map((watch) => {
            if (!watch) return null;

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
          .filter(Boolean);

        if (isMounted) {
          setBrands(brandsData);
          setWatches(processedWatches);
          setUsers(usersData);
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

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once on mount

  // Focus the search input when switching to the users tab
  useEffect(() => {
    if (activeTab === 'users' && searchInputRef.current) {
      // Use a slight delay to ensure the DOM has updated
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [activeTab]);

  const handleSaveWatch = async (watchData, mode) => {
    if (!watchData) {
      setError('No watch data provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      setError('Request timed out. The server may be unavailable.');
      setIsLoading(false);
    }, 10000);

    try {
      if (mode === 'add') {
        const newWatch = await api.watches.create(watchData);

        clearTimeout(timeoutId);

        if (!newWatch || typeof newWatch !== 'object') {
          throw new Error('Invalid response when creating watch');
        }

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
        const updatedWatch = await api.watches.update(
          currentWatch._id,
          watchData
        );

        clearTimeout(timeoutId);

        if (!updatedWatch || typeof updatedWatch !== 'object') {
          throw new Error('Invalid response when updating watch');
        }

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

      setIsWatchModalOpen(false);
      setCurrentWatch(null);
    } catch (err) {
      clearTimeout(timeoutId);

      console.error('Error saving watch:', err);
      setError(
        `Failed to ${mode === 'add' ? 'create' : 'update'} watch: ${err.message || 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWatch = (watch) => {
    if (!watch) return;

    setCurrentWatch(watch);
    setIsWatchModalOpen(true);
  };

  const handleSearchUser = async () => {
    if (!searchEmail) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchedUser(null);

    try {
      const foundUser = users.find(
        (user) => user.email.toLowerCase() === searchEmail.toLowerCase().trim()
      );

      if (foundUser) {
        setSearchedUser(foundUser);
      } else {
        setError('No user found with this email address');
      }
    } catch (err) {
      setError('Error searching for user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (target) => {
    if (!target) return;

    setConfirmDelete(target);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete || !confirmDelete._id) {
      setError('Invalid target selected for deletion');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (confirmDelete.model) {
        await api.watches.delete(confirmDelete._id);
        setWatches(watches.filter((watch) => watch._id !== confirmDelete._id));
      } else if (confirmDelete.email) {
        await api.users.delete(confirmDelete._id);
        setUsers(users.filter((user) => user._id !== confirmDelete._id));
        setSearchedUser(null);
      }

      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting:', err);
      setError(`Failed to delete: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const getBrandName = (watch) => {
    if (!watch) return 'Unknown Brand';

    if (
      watch.brand &&
      typeof watch.brand === 'object' &&
      watch.brand.brand_name
    ) {
      return watch.brand.brand_name;
    }

    if (watch.brand && typeof watch.brand === 'string') {
      const brandInfo = brands.find((b) => b._id === watch.brand);
      if (brandInfo) {
        return brandInfo.brand_name;
      }
    }

    return 'Unknown Brand';
  };

  const handleEditUser = (user) => {
    if (!user) return;

    setCurrentUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (userData, mode) => {
    if (!userData) {
      setError('No user data provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'add') {
        await api.users.create(userData);
        setUsers([...users, userData]);
      } else if (mode === 'edit' && currentUser) {
        await api.users.update(currentUser._id, userData);
        setUsers(
          users.map((user) =>
            user._id === currentUser._id ? { ...user, ...userData } : user
          )
        );
      } else {
        throw new Error('Invalid mode or missing user data');
      }

      setIsUserModalOpen(false);
      setCurrentUser(null);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(
        `Failed to ${mode === 'add' ? 'create' : 'update'} user: ${err.message || 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

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
                  setIsWatchModalOpen(true);
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
                    onClick={() => setIsWatchModalOpen(true)}
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

      case 'users':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>User Management</h2>
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="email"
                  placeholder="Search by email..."
                  className="search-input"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  ref={searchInputRef}
                />
                <button
                  className="btn btn-primary ml-2"
                  onClick={handleSearchUser}
                  disabled={isLoading}
                >
                  Search
                </button>
              </div>
              <button
                className="btn btn-primary btn-add"
                onClick={() => {
                  setCurrentUser(null);
                  setIsUserModalOpen(true);
                }}
                disabled={isLoading}
              >
                <Plus size={18} /> Add User
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

            <div className="data-container">
              {searchedUser ? (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{`${searchedUser.first_name} ${searchedUser.last_name}`}</td>
                      <td>{searchedUser.email}</td>
                      <td>{searchedUser.phone_number || 'N/A'}</td>
                      <td className="actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditUser(searchedUser)}
                          disabled={isLoading}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteClick(searchedUser)}
                          disabled={isLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>Search for a user by email</p>
                </div>
              )}
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
          <div className="sidebar">
            <div className="sidebar-menu">
              <button
                onClick={() => setActiveTab('watches')}
                className={`sidebar-item ${activeTab === 'watches' ? 'active' : ''}`}
              >
                Watch Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
              >
                User Management
              </button>
            </div>
          </div>
          <div className="main-content">
            <TabContent />
          </div>
        </div>
      </div>

      {isWatchModalOpen && (
        <WatchModal
          isOpen={isWatchModalOpen}
          onClose={() => {
            setIsWatchModalOpen(false);
            setCurrentWatch(null);
          }}
          watch={currentWatch}
          onSave={handleSaveWatch}
        />
      )}

      {isUserModalOpen && (
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setCurrentUser(null);
          }}
          user={currentUser}
          onSave={handleSaveUser}
        />
      )}

      {confirmDelete && (
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
            className="modal-container confirmation-modal"
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              width: '100%',
              maxWidth: '400px',
              overflow: 'hidden',
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
                Confirm Delete
              </h2>
              <button
                className="btn-close"
                onClick={handleCancelDelete}
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
            <div
              className="modal-content"
              style={{
                padding: '20px',
              }}
            >
              <p style={{ marginTop: 0, fontSize: '16px', color: '#333' }}>
                Are you sure you want to delete{' '}
                {confirmDelete.name || confirmDelete.model}?
              </p>
              <p
                style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}
              >
                This action cannot be undone.
              </p>
            </div>
            <div
              className="modal-footer"
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 20px',
                borderTop: '1px solid #eaeaea',
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={handleCancelDelete}
                style={{
                  padding: '10px 16px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  transition: 'background-color 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                style={{
                  padding: '10px 16px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#e53935',
                  color: 'white',
                  border: 'none',
                  transition: 'background-color 0.2s',
                }}
              >
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
