import React from 'react';
import { X, User, Mail, Phone, Building, Calendar, CheckCircle2, Clock, MapPin, Tag } from 'lucide-react';

const ComplaintModal = ({ complaint, isOpen, onClose, mode, onConfirmDelete, deleting }) => {
  if (!isOpen || !complaint) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-pending';
    const s = status.toLowerCase().replace(/\s+/g, '-');
    return `badge-${s}`;
  };

  if (mode === 'delete') {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '450px' }}>
          <div className="modal-header">
            <h3 className="modal-title" style={{ color: '#ef4444' }}>Confirm Delete</h3>
            <button className="btn-icon" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Are you sure you want to permanently delete <strong>Complaint #{complaint.complaint_id}</strong>?
          </p>
          <div style={{ background: '#fef2f2', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontSize: '0.825rem', color: '#991b1b', marginBottom: '1.5rem' }}>
            ⚠️ This will execute an actual SQL <code>DELETE</code> query on PostgreSQL. This record will be permanently removed.
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>
              Cancel
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => onConfirmDelete(complaint.complaint_id)}
              disabled={deleting}
            >
              {deleting ? 'Deleting from DB...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View Details Mode
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 className="modal-title">Complaint #{complaint.complaint_id}</h3>
              <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Category: {complaint.category}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* User Information Card */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={15} /> User Details
            </h4>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {complaint.user_name || `${complaint.first_name || ''} ${complaint.last_name || ''}`}
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <Mail size={13} /> {complaint.user_email}
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <Phone size={13} /> {complaint.user_phone}
            </p>
          </div>

          {/* Department Information Card */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={15} /> Department Details
            </h4>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {complaint.department_name}
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <MapPin size={13} /> {complaint.department_location}
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Area: {complaint.service_area}
            </p>
          </div>
        </div>

        {/* Complaint Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>Description</h4>
          <p style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem', lineHeight: '1.6', color: '#1e293b' }}>
            {complaint.description}
          </p>
        </div>

        {/* Timeline & Resolution Section */}
        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#1e40af', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={15} /> Resolution & Timeline
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem' }}>
            <div>
              <span style={{ color: '#475569', fontWeight: 500 }}>Reported Date:</span>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{formatDate(complaint.complaint_date)}</div>
            </div>
            <div>
              <span style={{ color: '#475569', fontWeight: 500 }}>Resolved Date:</span>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {complaint.resolved_date ? formatDate(complaint.resolved_date) : 'Not Yet Resolved'}
              </div>
            </div>
          </div>

          {complaint.resolution_time && (
            <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid #dbeafe', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Total Resolution Time: {complaint.resolution_time}
            </div>
          )}

          {complaint.remarks && (
            <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid #dbeafe', fontSize: '0.85rem' }}>
              <strong style={{ color: '#1e40af' }}>Resolution Remarks:</strong>
              <p style={{ color: '#1e293b', marginTop: '0.2rem' }}>{complaint.remarks}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
