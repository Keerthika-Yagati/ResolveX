import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../api';

function UserManager({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await getAllUsers(1, 100);
      if (result.code === 200) {
        setUsers(result.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateUser(editingUser.id, editingUser);
      if (result.code === 200) {
        await loadUsers();
        setShowEditModal(false);
        alert('User updated successfully!');
      } else {
        alert(result.message || 'Failed to update user');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const result = await deleteUser(userId);
        if (result.code === 200) {
          await loadUsers();
          alert('User deleted successfully!');
        } else {
          alert(result.message || 'Failed to delete user');
        }
      } catch (error) {
        alert('Network error. Please try again.');
      }
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 1: return 'User';
      case 2: return 'Developer';
      case 3: return 'Admin';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="content-card">
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>User Manager</h1>
        <p>Manage all users in the system</p>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(userItem => (
                <tr key={userItem.id}>
                  <td>{userItem.id}</td>
                  <td>{userItem.fullname}</td>
                  <td>{userItem.email}</td>
                  <td>{userItem.phone}</td>
                  <td><span className="role-badge">{getRoleName(userItem.role)}</span></td>
                  <td>
                    <span className={userItem.status === 1 ? 'status-active' : 'status-inactive'}>
                      {userItem.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(userItem)} 
                      className="btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(userItem.id, userItem.fullname)} 
                      className="btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editingUser.fullname || ''}
                  onChange={(e) => setEditingUser({...editingUser, fullname: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editingUser.role || 1}
                  onChange={(e) => setEditingUser({...editingUser, role: parseInt(e.target.value)})}
                >
                  <option value={1}>User</option>
                  <option value={2}>Developer</option>
                  <option value={3}>Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingUser.status || 1}
                  onChange={(e) => setEditingUser({...editingUser, status: parseInt(e.target.value)})}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManager;