import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import ComplaintTable from '../components/ComplaintTable';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintModal from '../components/ComplaintModal';
import { 
  getComplaints, 
  createComplaint, 
  updateComplaint, 
  deleteComplaint, 
  getDepartments, 
  getStatuses 
} from '../services/api';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Complaints with active filters
  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (deptFilter !== 'All') params.department_id = deptFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const data = await getComplaints(params);
      setComplaints(data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Unable to load complaints from PostgreSQL server.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load: Fetch departments and statuses for filter dropdowns
  useEffect(() => {
    Promise.all([getDepartments(), getStatuses()])
      .then(([deptsData, statusesData]) => {
        setDepartments(deptsData || []);
        setStatuses(statusesData || []);
      })
      .catch((err) => console.error('Error loading filter options:', err));
  }, []);

  // Re-fetch when search or filter values change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaintsData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, deptFilter, categoryFilter]);

  // Handle Create Submit
  const handleCreateSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await createComplaint(formData);
      setIsFormOpen(false);
      fetchComplaintsData();
    } catch (err) {
      alert(err.message || 'Unable to add complaint to PostgreSQL.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await updateComplaint(editItem.complaint_id, formData);
      setEditItem(null);
      fetchComplaintsData();
    } catch (err) {
      alert(err.message || 'Unable to update complaint in PostgreSQL.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async (id) => {
    try {
      setDeleting(true);
      await deleteComplaint(id);
      setDeleteItem(null);
      fetchComplaintsData();
    } catch (err) {
      alert(err.message || 'Unable to delete complaint from PostgreSQL.');
    } finally {
      setDeleting(false);
    }
  };

  // Extract unique categories for category filter
  const uniqueCategories = Array.from(new Set(complaints.map(c => c.category).filter(Boolean)));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Complaints Registry</h1>
          <p className="page-subtitle">Manage, assign, update, and resolve student & faculty complaints</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchComplaintsData} title="Refresh Table">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setIsFormOpen(true); }}>
            <Plus size={18} /> + Add Complaint
          </button>
        </div>
      </div>

      {/* Toolbar / Search & Filter Controls */}
      <div className="toolbar">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by ID, User, Category, Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Status Filter */}
          <select
            className="select-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {statuses.map((s) => (
              <option key={s.status_id} value={s.status}>{s.status}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            className="select-input"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
            ))}
          </select>

          {/* Category Filter */}
          {uniqueCategories.length > 0 && (
            <select
              className="select-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="toast-alert toast-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchComplaintsData}>Retry</button>
        </div>
      )}

      {/* Complaints Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Querying PostgreSQL database complaints table...</p>
        </div>
      ) : (
        <ComplaintTable
          complaints={complaints}
          onView={(item) => setViewItem(item)}
          onEdit={(item) => setEditItem(item)}
          onDelete={(id) => {
            const itemToDelete = complaints.find(c => c.complaint_id === id);
            setDeleteItem(itemToDelete);
          }}
        />
      )}

      {/* Add Complaint Modal */}
      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateSubmit}
        submitting={submitting}
      />

      {/* Edit Complaint Modal */}
      {editItem && (
        <ComplaintForm
          initialData={editItem}
          isOpen={Boolean(editItem)}
          onClose={() => setEditItem(null)}
          onSubmit={handleEditSubmit}
          submitting={submitting}
        />
      )}

      {/* View Complaint Details Modal */}
      {viewItem && (
        <ComplaintModal
          complaint={viewItem}
          isOpen={Boolean(viewItem)}
          onClose={() => setViewItem(null)}
          mode="view"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <ComplaintModal
          complaint={deleteItem}
          isOpen={Boolean(deleteItem)}
          onClose={() => setDeleteItem(null)}
          mode="delete"
          onConfirmDelete={handleConfirmDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Complaints;
