import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DepartmentForm = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
  const [formData, setFormData] = useState({
    department_name: '',
    location: '',
    service_area: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        department_name: initialData.department_name || '',
        location: initialData.location || '',
        service_area: initialData.service_area || '',
      });
    } else {
      setFormData({
        department_name: '',
        location: '',
        service_area: '',
      });
    }
  }, [initialData, isOpen]);

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
            {initialData ? `Edit Department #${initialData.department_id}` : 'Add New Department'}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Department Name *</label>
              <input
                type="text"
                name="department_name"
                className="form-input"
                placeholder="e.g. Electrical Department"
                value={formData.department_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Block A - Room 101"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Service Area / Responsibilities</label>
              <input
                type="text"
                name="service_area"
                className="form-input"
                placeholder="e.g. Campus electrical maintenance & power backup"
                value={formData.service_area}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving to Database...' : initialData ? 'Update Department' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;
