import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Complaints from './pages/Complaints';
import ComplaintDetails from './pages/ComplaintDetails';
import Departments from './pages/Departments';
import DatabaseExplorer from './pages/Database';

const Layout = () => {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/users')) return 'User Management';
    if (pathname.startsWith('/complaints/')) return 'Complaint Details';
    if (pathname.startsWith('/complaints')) return 'Complaint Management';
    if (pathname.startsWith('/departments')) return 'Department Directory';
    if (pathname.startsWith('/database')) return 'PostgreSQL SQL Viewer';
    return 'Complaint Management System';
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar pageTitle={getPageTitle(location.pathname)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/database" element={<DatabaseExplorer />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
