import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-left">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value}</span>
      </div>
      <div className="stat-card-right" style={{ backgroundColor: color, color: '#fff' }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
