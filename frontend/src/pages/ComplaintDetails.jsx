import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComplaintById, addComplaintStatus } from '../services/api';
import StatusModal from '../components/StatusModal';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Building2, 
  Clock, 
  CheckCircle2,
  Plus
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getComplaintById(id);
      if (res.data.success) {
        setComplaint(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError(`Failed to fetch complaint #${id} from PostgreSQL database.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateStatusSubmit = async (statusData) => {
    setIsSubmitting(true);
    try {
      await addComplaintStatus(id, statusData);
      setIsStatusModalOpen(false);
      fetchDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status record in PostgreSQL database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <div>Loading complaint details from PostgreSQL database...</div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div>
        <div className="alert-error">{error || 'Complaint not found'}</div>
        <Link to="/complaints" className="btn btn-outline">
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </Link>
      </div>
    );
  }

  const getStatusBadgeClass = (state) => {
    switch (state?.toLowerCase()) {
      case 'pending': return 'badge-pending';
      case 'in progress':
      case 'in_progress': return 'badge-in-progress';
      case 'resolved': return 'badge-resolved';
      case 'rejected': return 'badge-rejected';
      default: return 'badge-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', textDecoration: 'none', marginBottom: '8px', fontSize: '0.88rem', fontWeight: 500 }}>
            <ArrowLeft size={16} />
            Back to Complaints List
          </Link>
          <h1 className="page-title">Complaint #{complaint.complaint_id} Details</h1>
          <p className="page-subtitle">Full information retrieved via SQL JOINs from PostgreSQL</p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsStatusModalOpen(true)}>
          <Plus size={18} />
          <span>Update Status</span>
        </button>
      </div>

      {/* Info Cards Grid */}
      <div className="details-grid">
        {/* 1. Complaint Information */}
        <div className="info-card">
          <div className="info-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} />
            <span>Complaint Information</span>
          </div>

          <div className="info-item">
            <span className="info-label">Category:</span>
            <span className="category-pill">{complaint.category}</span>
          </div>

          <div className="info-item">
            <span className="info-label">State:</span>
            <span className={`badge ${getStatusBadgeClass(complaint.complaint_state)}`}>
              {complaint.complaint_state}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Created Date:</span>
            <span>{formatDate(complaint.created_at)}</span>
          </div>

          <div className="info-item" style={{ marginTop: '14px' }}>
            <span className="info-label" style={{ display: 'block', marginBottom: '4px' }}>Description:</span>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              {complaint.description}
            </div>
          </div>
        </div>

        {/* 2. User Information */}
        <div className="info-card">
          <div className="info-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} />
            <span>Reporting User</span>
          </div>

          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span>#{complaint.user_id}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Name:</span>
            <span style={{ fontWeight: 600 }}>{complaint.user_name}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Email:</span>
            <span>{complaint.user_email}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Phone:</span>
            <span>{complaint.user_phone || 'N/A'}</span>
          </div>
        </div>

        {/* 3. Department Information */}
        <div className="info-card">
          <div className="info-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} />
            <span>Assigned Department</span>
          </div>

          <div className="info-item">
            <span className="info-label">Department:</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
              {complaint.department_name}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Location:</span>
            <span>{complaint.department_location || 'N/A'}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Service Area:</span>
            <span>{complaint.department_service_area || 'General Maintenance'}</span>
          </div>
        </div>
      </div>

      {/* 4. Status History Timeline */}
      <div className="card-container">
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} />
            <span>Status History & Resolution Logs (statuses Table)</span>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {!complaint.statuses || complaint.statuses.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No status history available for this complaint.</div>
          ) : (
            <div className="timeline">
              {complaint.statuses.map((st) => (
                <div className="timeline-item" key={st.status_id}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className={`badge ${getStatusBadgeClass(st.status)}`}>
                        {st.status}
                      </span>
                      {st.resolved_date && (
                        <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} />
                          Resolved: {st.resolved_date} ({st.resolution_time || 'Recorded'})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      {st.remarks || 'No remarks provided.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleUpdateStatusSubmit}
        complaint={complaint}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ComplaintDetails;
