import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, Trash2, Clock } from 'lucide-react';

const ComplaintTable = ({ 
  complaints, 
  onEdit, 
  onDelete, 
  onUpdateStatus,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <div>Loading complaints from PostgreSQL database...</div>
      </div>
    );
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div className="state-container">
        <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px' }}>No complaints found</div>
        <div>Try changing search query/filters or register a new complaint.</div>
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
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Category</th>
            <th>Department</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((item) => (
            <tr key={item.complaint_id}>
              <td style={{ fontWeight: 600 }}>#{item.complaint_id}</td>
              <td>{item.user_name || `User #${item.user_id}`}</td>
              <td>
                <span className="category-pill">{item.category}</span>
              </td>
              <td>{item.department_name || 'Unassigned'}</td>
              <td style={{ maxWidth: '280px' }}>
                <div style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }} title={item.description}>
                  {item.description}
                </div>
              </td>
              <td>
                <span className={`badge ${getStatusBadgeClass(item.complaint_state)}`}>
                  {item.complaint_state}
                </span>
              </td>
              <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {formatDate(item.created_at)}
              </td>
              <td>
                <div className="action-buttons">
                  <Link 
                    to={`/complaints/${item.complaint_id}`} 
                    className="btn btn-outline btn-sm"
                    title="View Complaint Details"
                  >
                    <Eye size={14} />
                  </Link>

                  {onUpdateStatus && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => onUpdateStatus(item)}
                      title="Update Status History"
                    >
                      <Clock size={14} />
                    </button>
                  )}

                  {onEdit && (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => onEdit(item)}
                      title="Edit Complaint"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}

                  {onDelete && (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(item.complaint_id)}
                      title="Delete Complaint"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
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
