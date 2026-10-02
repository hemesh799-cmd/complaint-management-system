import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Clock, AlertTriangle, CheckCircle2, XCircle, 
  Building2, Plus, ArrowRight, Layers 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardStats, createComplaint } from '../services/api';
import ComplaintForm from '../components/ComplaintForm';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to connect to Express backend or PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await createComplaint(formData);
      setIsFormOpen(false);
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Connecting to PostgreSQL database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="toast-alert toast-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchStats}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="page-title">College Complaint Management Dashboard</h1>
          <p className="page-subtitle">Real-time complaint tracking & resolution statistics from PostgreSQL</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={18} /> + File New Complaint
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-stats">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats?.totalUsers} 
          color="#3b82f6" 
          bgLight="#eff6ff" 
        />
        <StatCard 
          icon={FileText} 
          label="Total Complaints" 
          value={stats?.totalComplaints} 
          color="#6366f1" 
          bgLight="#e0e7ff" 
        />
        <StatCard 
          icon={Clock} 
          label="Pending Complaints" 
          value={stats?.pendingComplaints} 
          color="#f59e0b" 
          bgLight="#fef3c7" 
        />
        <StatCard 
          icon={AlertTriangle} 
          label="In Progress" 
          value={stats?.inProgressComplaints} 
          color="#0284c7" 
          bgLight="#e0f2fe" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Resolved Complaints" 
          value={stats?.resolvedComplaints} 
          color="#16a34a" 
          bgLight="#dcfce7" 
        />
        <StatCard 
          icon={XCircle} 
          label="Rejected" 
          value={stats?.rejectedComplaints} 
          color="#e11d48" 
          bgLight="#ffe4e6" 
        />
      </div>

      {/* Main Grid: Recent Complaints & Department Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Recent Complaints */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Complaints</h3>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              onClick={() => navigate('/complaints')}
            >
              View All Complaints <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentComplaints?.map((item) => (
                  <tr key={item.complaint_id} style={{ cursor: 'pointer' }} onClick={() => navigate('/complaints')}>
                    <td><span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>#{item.complaint_id}</span></td>
                    <td><span style={{ fontWeight: 600 }}>{item.user_name}</span></td>
                    <td><span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{item.category}</span></td>
                    <td>{item.department_name}</td>
                    <td>
                      <span className={`badge badge-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Complaint Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="#3b82f6" /> Department Volume
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats?.departmentStats?.map((dept) => {
              const maxCount = Math.max(...(stats?.departmentStats?.map(d => d.count) || [1]), 1);
              const pct = Math.round((dept.count / maxCount) * 100);
              return (
                <div key={dept.department_name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dept.department_name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{dept.count} complaints</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${pct}%`, 
                        background: 'linear-gradient(90deg, #3b82f6, #6366f1)', 
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-out'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Add Complaint Modal */}
      <ComplaintForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default Dashboard;
