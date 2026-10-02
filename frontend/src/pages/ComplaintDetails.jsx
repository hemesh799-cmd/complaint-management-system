import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Building, MapPin, Layers, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getComplaintById } from '../services/api';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getComplaintById(id)
      .then((data) => {
        setComplaint(data);
        setError('');
      })
      .catch((err) => {
        console.error('Error fetching complaint details:', err);
        setError('Complaint not found or backend server error.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching complaint details from PostgreSQL database...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="page-container">
        <div className="toast-alert toast-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error || 'Complaint not found.'}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>Back to Complaints</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Top back navigation */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/complaints" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Complaints List
        </Link>
      </div>

      <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700 }}>COMPLAINT DETAILS</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Complaint #{complaint.complaint_id} — {complaint.category}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Reported on {new Date(complaint.complaint_date).toLocaleString()}
            </p>
          </div>

          <span className={`badge badge-${complaint.status.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
            {complaint.status}
          </span>
        </div>

        {/* 2 Column Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          
          {/* User Info */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} /> Complainant Information
            </h3>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {complaint.user_name}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} /> {complaint.user_email}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} /> {complaint.user_phone}
            </p>
          </div>

          {/* Department Info */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} /> Handling Department
            </h3>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {complaint.department_name}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} /> Location: {complaint.department_location}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={14} /> Service Area: {complaint.service_area}
            </p>
          </div>

        </div>

        {/* Complaint Description */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Full Description</h3>
          <div style={{ background: '#ffffff', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {complaint.description}
          </div>
        </div>

        {/* Resolution section */}
        <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#1e40af', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} /> Resolution Information & SQL Computed Time
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ color: '#475569' }}>Complaint Filed:</span>
              <div style={{ fontWeight: 600 }}>{new Date(complaint.complaint_date).toLocaleString()}</div>
            </div>
            <div>
              <span style={{ color: '#475569' }}>Resolved Date:</span>
              <div style={{ fontWeight: 600 }}>
                {complaint.resolved_date ? new Date(complaint.resolved_date).toLocaleString() : 'Pending Resolution'}
              </div>
            </div>
          </div>

          {complaint.resolution_time && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #dbeafe', fontSize: '0.9rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={18} /> Derived Resolution Time: {complaint.resolution_time}
            </div>
          )}

          {complaint.remarks && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #dbeafe' }}>
              <strong style={{ color: '#1e40af', fontSize: '0.9rem' }}>Staff Resolution Remarks:</strong>
              <p style={{ color: '#1e293b', marginTop: '0.25rem', fontSize: '0.9rem' }}>{complaint.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
