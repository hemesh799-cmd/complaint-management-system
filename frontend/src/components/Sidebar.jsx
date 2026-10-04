import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Building2, 
  Database,
  ShieldAlert
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <ShieldAlert size={20} />
        </div>
        <div>
          <div className="sidebar-brand-title">CMS Admin</div>
          <div className="sidebar-brand-subtitle">DBMS College Project</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/users" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Users</span>
        </NavLink>

        <NavLink 
          to="/complaints" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Complaints</span>
        </NavLink>

        <NavLink 
          to="/departments" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Building2 size={18} />
          <span>Departments</span>
        </NavLink>

        <NavLink 
          to="/database" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Database size={18} />
          <span>Database Viewer</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div>PostgreSQL + Express + React</div>
        <div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.7 }}>
          DBMS Full-Stack Architecture
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
