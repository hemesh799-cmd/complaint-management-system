import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Network/Server Error',
      status: error.response?.status || 500
    };
    return Promise.reject(customError);
  }
);

// ----------------- Complaint APIs -----------------
export const getComplaints = (params = {}) => api.get('/complaints', { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const createComplaint = (data) => api.post('/complaints', data);
export const updateComplaint = (id, data) => api.put(`/complaints/${id}`, data);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);

// ----------------- User APIs -----------------
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);

// ----------------- Department APIs -----------------
export const getDepartments = () => api.get('/departments');
export const getDepartmentById = (id) => api.get(`/departments/${id}`);
export const createDepartment = (data) => api.post('/departments', data);

// ----------------- Status APIs -----------------
export const getStatuses = () => api.get('/statuses');

// ----------------- Dashboard API -----------------
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;
