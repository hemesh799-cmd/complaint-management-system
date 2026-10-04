import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import UserForm from '../components/UserForm';
import { Plus, Edit2, Trash2, UserCheck } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users from PostgreSQL database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleSubmitUser = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        await updateUser(selectedUser.user_id, formData);
      } else {
        await createUser(formData);
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Failed to save user in PostgreSQL database. Ensure email is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user #${userId}? All associated complaints will also be deleted due to CASCADE foreign keys.`)) {
      return;
    }
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user from PostgreSQL database.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered Users</h1>
          <p className="page-subtitle">Manage system users, students, and staff profile records</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card-container">
        <div className="card-header">
          <div className="card-title">All Users ({users.length})</div>
          <div className="db-status-badge" style={{ fontSize: '0.74rem' }}>
            <UserCheck size={12} />
            <span>users Table</span>
          </div>
        </div>

        {isLoading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <div>Loading users from PostgreSQL database...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="state-container">
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No users found in database</div>
            <div>Click "+ Add New User" to insert a user record into PostgreSQL.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td style={{ fontWeight: 600 }}>#{u.user_id}</td>
                    <td>{u.first_name}</td>
                    <td>{u.last_name}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {u.first_name} {u.last_name}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone_number || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEditModal(u)}
                          title="Edit User"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(u.user_id)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitUser}
        initialData={selectedUser}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Users;
