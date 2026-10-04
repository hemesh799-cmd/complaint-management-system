import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../services/api';
import DepartmentForm from '../components/DepartmentForm';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDepartments();
      if (res.data.success) {
        setDepartments(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to fetch departments from PostgreSQL database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedDept(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setSelectedDept(dept);
    setIsFormOpen(true);
  };

  const handleSubmitDepartment = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedDept) {
        await updateDepartment(selectedDept.department_id, formData);
      } else {
        await createDepartment(formData);
      }
      setIsFormOpen(false);
      fetchDepartments();
    } catch (err) {
      console.error('Error saving department:', err);
      alert('Failed to save department in PostgreSQL database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm(`Are you sure you want to delete department #${deptId}? Complaints assigned to this department will become unassigned.`)) {
      return;
    }
    try {
      await deleteDepartment(deptId);
      fetchDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      alert('Failed to delete department from PostgreSQL database.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">College Departments</h1>
          <p className="page-subtitle">Manage campus complaint-handling departments and service areas</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card-container">
        <div className="card-header">
          <div className="card-title">All Departments ({departments.length})</div>
          <div className="db-status-badge" style={{ fontSize: '0.74rem' }}>
            <Building2 size={12} />
            <span>departments Table</span>
          </div>
        </div>

        {isLoading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <div>Loading departments from PostgreSQL database...</div>
          </div>
        ) : departments.length === 0 ? (
          <div className="state-container">
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No departments found in database</div>
            <div>Click "+ Add Department" to insert a department record into PostgreSQL.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Department Name</th>
                  <th>Campus Location</th>
                  <th>Service Area / Responsibilities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.department_id}>
                    <td style={{ fontWeight: 600 }}>#{d.department_id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {d.department_name}
                    </td>
                    <td>{d.location || 'N/A'}</td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }} title={d.service_area}>
                        {d.service_area || 'General Services'}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEditModal(d)}
                          title="Edit Department"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteDepartment(d.department_id)}
                          title="Delete Department"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DepartmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitDepartment}
        initialData={selectedDept}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Departments;
