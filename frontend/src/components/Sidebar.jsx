import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Building2, Tag, ShieldAlert } from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Complaints', path: '/complaints', icon: FileText },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Departments', path: '/departments', icon: Building2 },
    { label: 'Statuses', path: '/statuses', icon: Tag },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40
          }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <ShieldAlert size={26} color="#3b82f6" />
          </div>
          <div className="brand-text">
            <h2>CMS Portal</h2>
            <span>DBMS College Project</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN NAVIGATION</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="db-badge">
            <span className="dot"></span>
            PostgreSQL Active
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar {
          width: 260px;
          background-color: var(--bg-sidebar);
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-dark);
          transition: transform 0.3s ease;
          z-index: 50;
        }

        .sidebar-brand {
          padding: 1.5rem 1.5rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .brand-text h2 {
          color: #ffffff;
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .brand-text span {
          font-size: 0.725rem;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          padding: 1.25rem 0.85rem;
          flex: 1;
        }

        .nav-section-label {
          font-size: 0.675rem;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.08em;
          padding: 0 0.75rem 0.75rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 0.85rem;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: var(--radius-md);
          margin-bottom: 0.25rem;
          transition: var(--transition);
        }

        .nav-link:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
          color: #ffffff;
          background-color: var(--accent-primary);
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .sidebar-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .db-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.775rem;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(56, 189, 248, 0.2);
          font-weight: 600;
        }

        .db-badge .dot {
          width: 7px;
          height: 7px;
          background-color: #38bdf8;
          border-radius: 50%;
          box-shadow: 0 0 8px #38bdf8;
        }

        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
