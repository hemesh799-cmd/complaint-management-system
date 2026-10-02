import React from 'react';
import { Eye, Edit3, Trash2, Calendar, Building, User, Tag } from 'lucide-react';

const ComplaintTable = ({ complaints, onView, onEdit, onDelete }) => {
  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-pending';
    const s = status.toLowerCase().replace(/\s+/g, '-');
    return `badge-${s}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!complaints || complaints.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1rem', fontWeight: 500 }}>No complaints found matching criteria.</p>
        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Try resetting filters or adding a new complaint.</span>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Category</th>
            <th>Department</th>
            <th>Status</th>
            <th>Date Reported</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((item) => (
            <tr key={item.complaint_id}>
              <td>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                  #{item.complaint_id}
                </span>
              </td>

              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.user_name || `${item.first_name || ''} ${item.last_name || ''}`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.user_email}
                  </span>
                </div>
              </td>

              <td>
                <span style={{
                  backgroundColor: '#f1f5f9',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}>
                  {item.category}
                </span>
              </td>

              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <Building size={14} />
                  {item.department_name}
                </span>
              </td>

              <td>
                <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                  {item.status}
                </span>
              </td>

              <td>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  {formatDate(item.complaint_date)}
                </span>
              </td>

              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                  <button 
                    className="btn-icon" 
                    title="View Details"
                    onClick={() => onView(item)}
                    style={{ color: '#3b82f6' }}
                  >
                    <Eye size={17} />
                  </button>
                  
                  <button 
                    className="btn-icon" 
                    title="Edit Complaint"
                    onClick={() => onEdit(item)}
                    style={{ color: '#f59e0b' }}
                  >
                    <Edit3 size={17} />
                  </button>
                  
                  <button 
                    className="btn-icon" 
                    title="Delete Complaint"
                    onClick={() => onDelete(item.complaint_id)}
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintTable;
