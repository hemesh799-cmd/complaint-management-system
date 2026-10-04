import React from 'react';
import { Database, RefreshCw } from 'lucide-react';

const Navbar = ({ pageTitle, onRefresh, isRefreshing }) => {
  return (
    <header className="navbar">
      <div className="navbar-title">
        {pageTitle || 'Complaint Management System'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="db-status-badge">
          <div className="db-status-dot"></div>
          <Database size={14} />
          <span>PostgreSQL Live</span>
        </div>

        {onRefresh && (
          <button 
            className="btn btn-outline btn-sm" 
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
