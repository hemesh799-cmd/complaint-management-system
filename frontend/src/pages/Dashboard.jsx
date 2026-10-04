import React, { useState, useEffect } from 'react';
import { getDashboardData, getUsers, getDepartments, createComplaint } from '../services/api';
import StatCard from '../components/StatCard';
import ComplaintTable from '../components/ComplaintTable';
import ComplaintForm from '../components/ComplaintForm';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Plus 
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_complaints: 0,
    pending_complaints: 0,
    in_progress_complaints: 0,
    resolved_complaints: 0,
    total_departments: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick complaint creation states
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDashboardData();
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentComplaints(res.data.recentComplaints || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to connect to Express REST API / PostgreSQL database. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenForm = async () => {
    try {
      const [userRes, deptRes] = await Promise.all([getUsers(), getDepartments()]);
      setUsers(userRes.data.data || []);
      setDepartments(deptRes.data.data || []);
      setIsFormOpen(true);
    } catch (err) {
      console.error('Error loading users or departments:', err);
      alert('Could not load users or departments for complaint registration.');
    }
  };

  const handleRegisterComplaint = async (formData) => {
    setIsSubmitting(true);
    try {
      await createComplaint(formData);
      setIsFormOpen(false);
      fetchDashboard();
    } catch (err) {
      console.error('Error creating complaint:', err);
      alert('Failed to register complaint in PostgreSQL database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">College System Dashboard</h1>
          <p className="page-subtitle">Real-time stats generated directly from PostgreSQL queries</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenForm}>
          <Plus size={18} />
          <span>Register New Complaint</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* 6 Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Users"
          value={stats.total_users}
          icon={Users}
          color="#4f46e5"
          bgColor="#eef2ff"
        />
        <StatCard
          title="Total Complaints"
          value={stats.total_complaints}
          icon={FileText}
          color="#0284c7"
          bgColor="#e0f2fe"
        />
        <StatCard
          title="Pending"
          value={stats.pending_complaints}
          icon={Clock}
          color="#b45309"
          bgColor="#fef3c7"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress_complaints}
          icon={AlertCircle}
          color="#1d4ed8"
          bgColor="#dbeafe"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved_complaints}
          icon={CheckCircle2}
          color="#047857"
          bgColor="#d1fae5"
        />
        <StatCard
          title="Departments"
          value={stats.total_departments}
          icon={Building2}
          color="#7c3aed"
          bgColor="#f3e8ff"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="card-container">
        <div className="card-header">
          <div className="card-title">Recent Submitted Complaints</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing latest 5 entries from PostgreSQL
          </div>
        </div>
        <ComplaintTable
          complaints={recentComplaints}
          isLoading={isLoading}
        />
      </div>

      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleRegisterComplaint}
        users={users}
        departments={departments}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Dashboard;
