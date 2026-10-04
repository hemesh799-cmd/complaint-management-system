import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ComplaintForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  users = [], 
  departments = [], 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    department_id: '',
    category: 'Electrical',
    description: '',
    complaint_state: 'Pending',
  });

  const categories = [
    'Electrical',
    'Maintenance',
    'Hostel',
    'Transport',
    'IT',
    'Academic',
    'Cleanliness',
    'Other',
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        user_id: initialData.user_id || '',
        department_id: initialData.department_id || '',
        category: initialData.category || 'Electrical',
        description: initialData.description || '',
        complaint_state: initialData.complaint_state || 'Pending',
      });
    } else {
      setFormData({
        user_id: users.length > 0 ? users[0].user_id : '',
        department_id: departments.length > 0 ? departments[0].department_id : '',
        category: 'Electrical',
        description: '',
        complaint_state: 'Pending',
      });
    }
  }, [initialData, users, departments, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            {initialData ? `Edit Complaint #${initialData.complaint_id}` : 'Register New Complaint'}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!initialData && (
              <div className="form-group">
                <label className="form-label">Select Reporting User *</label>
                <select
                  name="user_id"
                  className="select-input"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>-- Select User --</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Assign Department</label>
              <select
                name="department_id"
                className="select-input"
                value={formData.department_id}
                onChange={handleChange}
              >
                <option value="">-- Unassigned --</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.department_name} ({d.location || 'Main Building'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Complaint Category *</label>
              <select
                name="category"
                className="select-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {initialData && (
              <div className="form-group">
                <label className="form-label">Complaint State</label>
                <select
                  name="complaint_state"
                  className="select-input"
                  value={formData.complaint_state}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Describe the complaint issue in detail..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving to PostgreSQL...' : initialData ? 'Update Complaint' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
