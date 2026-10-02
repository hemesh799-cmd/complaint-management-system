import React from 'react';
import { Menu, Database, Server, GraduationCap } from 'lucide-react';

const Header = ({ setMobileOpen }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="btn-icon mobile-toggle" 
          onClick={() => setMobileOpen(true)}
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>
        <div className="college-tag">
          <GraduationCap size={20} color="#3b82f6" />
          <span className="college-name">College Complaint Portal</span>
        </div>
      </div>

      <div className="header-right">
        <div className="tech-stack-indicator">
          <span className="tech-item"><Server size={14} /> Express REST</span>
          <span className="divider">•</span>
          <span className="tech-item"><Database size={14} /> PostgreSQL Source of Truth</span>
        </div>
      </div>

      <style>{`
        .app-header {
          height: 64px;
          background-color: var(--bg-header);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          box-shadow: var(--shadow-sm);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-toggle {
          display: none;
        }

        .college-tag {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .tech-stack-indicator {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          background-color: #f1f5f9;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid #e2e8f0;
          font-weight: 500;
        }

        .tech-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .tech-stack-indicator .divider {
          color: #cbd5e1;
        }

        @media (max-width: 900px) {
          .app-header {
            padding: 0 1rem;
          }

          .mobile-toggle {
            display: flex;
          }

          .tech-stack-indicator {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
