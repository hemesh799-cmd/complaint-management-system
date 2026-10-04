import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => {
  return (
    <div className="stat-card">
      <div 
        className="stat-card-icon" 
        style={{ backgroundColor: bgColor || '#eef2ff', color: color || '#4f46e5' }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div className="stat-card-label">{title}</div>
        <div className="stat-card-value">{value !== undefined ? value : 0}</div>
      </div>
    </div>
  );
};

export default StatCard;
