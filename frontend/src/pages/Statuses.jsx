import React, { useState, useEffect } from 'react';
import { Tag, AlertCircle, Clock, CheckCircle2, AlertTriangle, XCircle, Database } from 'lucide-react';
import { getStatuses } from '../services/api';

const Statuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getStatuses();
      setStatuses(data || []);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setError('Failed to load complaint statuses from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const getStatusIcon = (statusName) => {
    const s = statusName.toLowerCase();
    if (s === 'pending') return <Clock size={20} color="#d97706" />;
    if (s === 'in progress') return <AlertTriangle size={20} color="#0284c7" />;
    if (s === 'resolved') return <CheckCircle2 size={20} color="#16a34a" />;
    if (s === 'rejected') return <XCircle size={20} color="#dc2626" />;
    return <Tag size={20} color="#6366f1" />;
  };

  const getStatusDesc = (statusName) => {
    const s = statusName.toLowerCase();
    if (s === 'pending') return 'Complaint filed by user; pending initial department review and staff assignment.';
    if (s === 'in progress') return 'Complaint under active investigation and repair work by assigned department technicians.';
    if (s === 'resolved') return 'Complaint successfully resolved. PostgreSQL trigger/backend sets resolved_date and calculates derived resolution time.';
    if (s === 'rejected') return 'Complaint evaluated and closed without action due to institutional policy or invalid scope.';
    return 'System status state.';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Complaint Statuses</h1>
          <p className="page-subtitle">Master lookup table states stored in PostgreSQL <code>statuses</code> table</p>
        </div>
      </div>

      {error && (
        <div className="toast-alert toast-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchStatuses}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading statuses from PostgreSQL database...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {statuses.map((item) => (
            <div key={item.status_id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {getStatusIcon(item.status)}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.status}</h3>
                </div>
                <span className={`badge badge-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  ID: #{item.status_id}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                {getStatusDesc(item.status)}
              </p>

              <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={13} /> Stored in table <code>statuses</code> (FK in <code>complaints.status_id</code>)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Statuses;
