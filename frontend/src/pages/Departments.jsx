import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Layers, FileText, AlertCircle, X } from 'lucide-react';
import { getDepartments, getDepartmentById, createDepartment } from '../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Department Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    department_name: '',
    location: '',
    service_area: ''
  });

  // Selected Department Modal
  const [selectedDeptHistory, setSelectedDeptHistory] = useState(null);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments from PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_name || !formData.location || !formData.service_area) {
      alert('All fields are required.');
      return;
    }

    try {
      setSubmitting(true);
      await createDepartment(formData);
      setIsAddOpen(false);
      setFormData({ department_name: '', location: '', service_area: '' });
      fetchDepts();
    } catch (err) {
      alert(err.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeptClick = async (id) => {
    try {
      const data = await getDepartmentById(id);
      setSelectedDeptHistory(data);
    } catch (err) {
      alert('Failed to load department complaints.');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">College Departments</h1>
          <p className="page-subtitle">Institutional service divisions and complaint handling units</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={18} /> + Add Department
        </button>
      </div>

      {error && (
        <div className="toast-alert toast-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchDepts}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Querying PostgreSQL departments table...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {departments.map((dept) => (
            <div key={dept.department_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ background: '#eff6ff', color: '#3b82f6', width: '42px', height: '42px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={22} />
                  </div>
                  <span style={{
                    backgroundColor: '#f1f5f9',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {dept.assigned_complaints} Assigned
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {dept.department_name}
                </h3>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <MapPin size={14} color="#64748b" /> {dept.location}
                </p>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  <Layers size={14} color="#94a3b8" /> Scope: {dept.service_area}
                </p>
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '0.825rem' }}
                onClick={() => handleDeptClick(dept.department_id)}
              >
                <FileText size={15} /> View Department Complaints
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">+ Add Department</h3>
              <button className="btn-icon" onClick={() => setIsAddOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Department Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Computer Science, Transport"
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location <span className="required">*</span></label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Academic Block A, 2nd Floor"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Area <span className="required">*</span></label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Lab Infrastructure & Software"
                  value={formData.service_area}
                  onChange={(e) => setFormData({ ...formData, service_area: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving to Database...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Assigned Complaints History Modal */}
      {selectedDeptHistory && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedDeptHistory.department_name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Location: {selectedDeptHistory.location}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setSelectedDeptHistory(null)}>
                <X size={20} />
              </button>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              Assigned Complaints ({selectedDeptHistory.complaints?.length || 0})
            </h4>

            {selectedDeptHistory.complaints?.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No complaints assigned to this department.</p>
            ) : (
              <div className="table-container" style={{ border: '1px solid var(--border-color)', maxHeight: '350px', overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDeptHistory.complaints.map((c) => (
                      <tr key={c.complaint_id}>
                        <td><span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>#{c.complaint_id}</span></td>
                        <td>{c.user_name}</td>
                        <td><span style={{ fontWeight: 500 }}>{c.category}</span></td>
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
              <button className="btn btn-secondary" onClick={() => setSelectedDeptHistory(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
