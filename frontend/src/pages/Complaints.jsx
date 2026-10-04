import React, { useState, useEffect } from 'react';
import { 
  getComplaints, 
  getUsers, 
  getDepartments, 
  createComplaint, 
  updateComplaint, 
  deleteComplaint,
  addComplaintStatus
} from '../services/api';
import ComplaintTable from '../components/ComplaintTable';
import ComplaintForm from '../components/ComplaintForm';
import StatusModal from '../components/StatusModal';
import { Plus, Search, Filter } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Form & Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [compRes, userRes, deptRes] = await Promise.all([
        getComplaints(),
        getUsers(),
        getDepartments()
      ]);

      if (compRes.data.success) setComplaints(compRes.data.data || []);
      if (userRes.data.success) setUsers(userRes.data.data || []);
      if (deptRes.data.success) setDepartments(deptRes.data.data || []);
    } catch (err) {
      console.error('Error loading complaints data:', err);
      setError('Failed to fetch complaints from PostgreSQL database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRegisterModal = () => {
    setSelectedComplaint(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsFormOpen(true);
  };

  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsStatusModalOpen(true);
  };

  const handleSubmitComplaint = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedComplaint) {
        await updateComplaint(selectedComplaint.complaint_id, formData);
      } else {
        await createComplaint(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving complaint:', err);
      alert('Failed to save complaint in PostgreSQL database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatusSubmit = async (statusData) => {
    if (!selectedComplaint) return;
    setIsSubmitting(true);
    try {
      await addComplaintStatus(selectedComplaint.complaint_id, statusData);
      setIsStatusModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status record in PostgreSQL database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm(`Are you sure you want to delete complaint #${complaintId}?`)) {
      return;
    }
    try {
      await deleteComplaint(complaintId);
      fetchData();
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Failed to delete complaint from PostgreSQL database.');
    }
  };

  // Filter complaints dynamically
  const filteredComplaints = complaints.filter((c) => {
    // State Filter
    if (selectedStateFilter !== 'All' && c.complaint_state !== selectedStateFilter) {
      return false;
    }
    // Category Filter
    if (selectedCategoryFilter !== 'All' && c.category !== selectedCategoryFilter) {
      return false;
    }
    // Department Filter
    if (selectedDeptFilter !== 'All' && String(c.department_id) !== String(selectedDeptFilter)) {
      return false;
    }
    // Search Term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchId = String(c.complaint_id).includes(term);
      const matchUser = c.user_name?.toLowerCase().includes(term);
      const matchCat = c.category?.toLowerCase().includes(term);
      const matchDesc = c.description?.toLowerCase().includes(term);
      return matchId || matchUser || matchCat || matchDesc;
    }
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Complaint Management</h1>
          <p className="page-subtitle">Track, assign departments, and process registered complaints</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenRegisterModal}>
          <Plus size={18} />
          <span>Register Complaint</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, User name, Category, Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />

          <select
            className="select-input"
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
          >
            <option value="All">All States</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="select-input"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Hostel">Hostel</option>
            <option value="Transport">Transport</option>
            <option value="IT">IT</option>
            <option value="Academic">Academic</option>
            <option value="Cleanliness">Cleanliness</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="select-input"
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.department_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table Card */}
      <div className="card-container">
        <div className="card-header">
          <div className="card-title">
            Complaints List ({filteredComplaints.length} of {complaints.length})
          </div>
        </div>

        <ComplaintTable
          complaints={filteredComplaints}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteComplaint}
          onUpdateStatus={handleOpenStatusModal}
          isLoading={isLoading}
        />
      </div>

      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitComplaint}
        initialData={selectedComplaint}
        users={users}
        departments={departments}
        isSubmitting={isSubmitting}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleUpdateStatusSubmit}
        complaint={selectedComplaint}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Complaints;
