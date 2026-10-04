import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, onSubmit, complaint, isSubmitting }) => {
  const [formData, setFormData] = useState({
    status: 'In Progress',
    remarks: '',
    resolved_date: '',
    resolution_time: '',
  });

  useEffect(() => {
    if (complaint) {
      setFormData({
        status: complaint.complaint_state || 'In Progress',
        remarks: '',
        resolved_date: '',
        resolution_time: '',
      });
    }
  }, [complaint, isOpen]);

  if (!isOpen || !complaint) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto populate today's date if user selects 'Resolved' and date is empty
    if (name === 'status' && value === 'Resolved' && !formData.resolved_date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData((prev) => ({
        ...prev,
        status: value,
        resolved_date: today,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
            Update Status for Complaint #{complaint.complaint_id}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">New Status *</label>
              <select
                name="status"
                className="select-input"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Update Remarks / Progress Note *</label>
              <textarea
                name="remarks"
                className="form-textarea"
                placeholder="e.g. Technician dispatched to inspect the issue..."
                value={formData.remarks}
                onChange={handleChange}
                required
              />
            </div>

            {formData.status === 'Resolved' && (
              <>
                <div className="form-group">
                  <label className="form-label">Resolved Date</label>
                  <input
                    type="date"
                    name="resolved_date"
                    className="form-input"
                    value={formData.resolved_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Resolution Time</label>
                  <input
                    type="text"
                    name="resolution_time"
                    className="form-input"
                    placeholder="e.g. 2 days, 4 hours"
                    value={formData.resolution_time}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating Status in PostgreSQL...' : 'Record Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusModal;
