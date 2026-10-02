import React, { useState, useEffect } from 'react';
import { Users as UserIcon, Plus, Mail, Phone, FileText, AlertCircle, X, CheckCircle, Clock } from 'lucide-react';
import { getUsers, getUserById, createUser } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add User Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  });

  // Selected User Complaint History Modal
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users from PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone_number) {
      alert('All fields are required.');
      return;
    }

    try {
      setSubmitting(true);
      await createUser(formData);
      setIsAddOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', phone_number: '' });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to add user to PostgreSQL.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserClick = async (userId) => {
    try {
      setLoadingHistory(true);
      const data = await getUserById(userId);
      setSelectedUserHistory(data);
    } catch (err) {
      alert('Failed to load user complaint history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered Users</h1>
          <p className="page-subtitle">Students, faculty, and administrative staff reporting complaints</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={18} /> + Add New User
        </button>
      </div>

      {error && (
        <div className="toast-alert toast-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users from PostgreSQL database...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Total Complaints</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      #{u.user_id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.name || `${u.first_name} ${u.last_name}`}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={14} /> {u.email}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={14} /> {u.phone_number}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem'
                    }}>
                      {u.total_complaints} {u.total_complaints === 1 ? 'complaint' : 'complaints'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      onClick={() => handleUserClick(u.user_id)}
                    >
                      <FileText size={14} /> View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">+ Add New User</h3>
              <button className="btn-icon" onClick={() => setIsAddOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="text-input"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="text-input"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="text-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number <span className="required">*</span></label>
                <input
                  type="text"
                  className="text-input"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="9876543210"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving to Database...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Complaint History Modal */}
      {selectedUserHistory && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedUserHistory.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedUserHistory.email} • {selectedUserHistory.phone_number}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setSelectedUserHistory(null)}>
                <X size={20} />
              </button>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              Complaint History ({selectedUserHistory.complaints?.length || 0})
            </h4>

            {selectedUserHistory.complaints?.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No complaints filed by this user.</p>
            ) : (
              <div className="table-container" style={{ border: '1px solid var(--border-color)', maxHeight: '350px', overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserHistory.complaints.map((c) => (
                      <tr key={c.complaint_id}>
                        <td><span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>#{c.complaint_id}</span></td>
                        <td><span style={{ fontWeight: 500 }}>{c.category}</span></td>
                        <td>{c.department_name}</td>
                        <td>
                          <span className={`badge badge-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedUserHistory(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
