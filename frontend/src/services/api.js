import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard Service
export const getDashboardData = () => api.get('/dashboard');

// Users Service
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Departments Service
export const getDepartments = () => api.get('/departments');
export const getDepartmentById = (id) => api.get(`/departments/${id}`);
export const createDepartment = (deptData) => api.post('/departments', deptData);
export const updateDepartment = (id, deptData) => api.put(`/departments/${id}`, deptData);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);

// Complaints Service
export const getComplaints = () => api.get('/complaints');
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const createComplaint = (complaintData) => api.post('/complaints', complaintData);
export const updateComplaint = (id, complaintData) => api.put(`/complaints/${id}`, complaintData);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);

// Statuses Service
export const getComplaintStatuses = (complaintId) => api.get(`/complaints/${complaintId}/statuses`);
export const addComplaintStatus = (complaintId, statusData) => api.post(`/complaints/${complaintId}/statuses`, statusData);
export const updateStatus = (statusId, statusData) => api.put(`/statuses/${statusId}`, statusData);

// Database / SQL Tables Explorer Service (Mandatory Requirement)
export const getDatabaseTablesInfo = () => api.get('/database/tables');
export const getDatabaseUsersTable = () => api.get('/database/users');
export const getDatabaseDepartmentsTable = () => api.get('/database/departments');
export const getDatabaseComplaintsTable = () => api.get('/database/complaints');
export const getDatabaseStatusesTable = () => api.get('/database/statuses');
export const getDatabaseTableSchema = (tableName) => api.get(`/database/schema/${tableName}`);

export default api;
