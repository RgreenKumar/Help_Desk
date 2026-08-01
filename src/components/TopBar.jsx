import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TopBar.css';

const TopBar = () => {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search tickets, users..." className="search-input" />
        </div>
      </div>
      <div className="topbar-right">
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <div className="user-avatar-small">
          {user?.name?.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
