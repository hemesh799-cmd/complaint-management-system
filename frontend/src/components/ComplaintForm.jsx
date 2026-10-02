import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { getUsers, getDepartments, getStatuses } from '../services/api';

const ComplaintForm = ({ initialData, isOpen, onClose, onSubmit, submitting }) => {
  const [usersList, setUsersList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [statusesList, setStatusesList] = useState([]);

  const [formData, setFormData] = useState({
    user_id: '',
    department_id: '',
    status_id: '1', // Default Pending
    category: '',
    description: '',
    remarks: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const isEditMode = Boolean(initialData && initialData.complaint_id);

  // Fetch Dropdown options from PostgreSQL API
  useEffect(() => {
    if (isOpen) {
      Promise.all([getUsers(), getDepartments(), getStatuses()])
        .then(([usersData, deptsData, statusesData]) => {
          setUsersList(usersData || []);
          setDepartmentsList(deptsData || []);
          setStatusesList(statusesData || []);

          if (isEditMode) {
            setFormData({
              user_id: initialData.user_id || '',
              department_id: initialData.department_id || '',
              status_id: initialData.status_id || '1',
              category: initialData.category || '',
              description: initialData.description || '',
              remarks: initialData.remarks || ''
            });
          } else {
            setFormData({
              user_id: usersData && usersData.length > 0 ? usersData[0].user_id : '',
              department_id: deptsData && deptsData.length > 0 ? deptsData[0].department_id : '',
              status_id: '1',
              category: '',
              description: '',
              remarks: ''
            });
          }
        })
        .catch((err) => {
          console.error('Error fetching form dropdown options:', err);
          setErrorMsg('Failed to load users/departments/statuses from database server.');
        });
    }
  }, [isOpen, initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.category.trim()) {
      setErrorMsg('Category is required.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Description is required.');
      return;
    }
    if (!formData.user_id) {
      setErrorMsg('Please select a user.');
      return;
    }
    if (!formData.department_id) {
      setErrorMsg('Please select a department.');
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditMode ? `Edit Complaint #${initialData.complaint_id}` : '+ File New Complaint'}
          </h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="toast-alert toast-error">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* User Selection */}
          <div className="form-group">
            <label className="form-label">
              User / Student <span className="required">*</span>
            </label>
            <select
              name="user_id"
              className="select-input"
              value={formData.user_id}
              onChange={handleChange}
              disabled={isEditMode}
            >
              {usersList.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name || `${u.first_name} ${u.last_name}`} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Department Selection */}
          <div className="form-group">
            <label className="form-label">
              Assigned Department <span className="required">*</span>
            </label>
            <select
              name="department_id"
              className="select-input"
              value={formData.department_id}
              onChange={handleChange}
            >
              {departmentsList.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name} — {d.location}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">
              Category <span className="required">*</span>
            </label>
            <input
              type="text"
              name="category"
              className="text-input"
              placeholder="e.g. Hostel, Electrical, Software, Transport, Mess"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label">
              Complaint Status <span className="required">*</span>
            </label>
            <select
              name="status_id"
              className="select-input"
              value={formData.status_id}
              onChange={handleChange}
            >
              {statusesList.map((s) => (
                <option key={s.status_id} value={s.status_id}>
                  {s.status}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              className="textarea-input"
              rows={4}
              placeholder="Provide exact issue details, location, and observed problem..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Remarks (Only in edit mode or when status changed) */}
          <div className="form-group">
            <label className="form-label">Resolution Remarks / Staff Notes</label>
            <textarea
              name="remarks"
              className="textarea-input"
              rows={2}
              placeholder="Add resolution details or action taken..."
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={18} />
              {submitting ? 'Saving to Database...' : isEditMode ? 'Update Complaint' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
