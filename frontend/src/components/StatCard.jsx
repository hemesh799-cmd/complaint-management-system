import React from 'react';

const StatCard = ({ icon: Icon, label, value, color, bgLight }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bgLight, color: color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value !== undefined ? value : '0'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
