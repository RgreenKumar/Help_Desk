import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Building2,
  Ticket,
  BarChart3,
  Bell,
  Clock,
  UserCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-circle"></div>
        <span className="logo-text">RGreen Support</span>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">OVERVIEW</span>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="nav-section">
            <span className="nav-label">ADMINISTRATION</span>

            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Users size={20} />
              Employees
            </NavLink>

            <NavLink
              to="/support-engineers"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Wrench size={20} />
              Support engineers
            </NavLink>

            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Building2 size={20} />
              Departments
            </NavLink>
          </div>
        )}

        <div className="nav-section">
          <span className="nav-label">SERVICE DESK</span>

          <NavLink
            to="/tickets"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Ticket size={20} />
            Tickets
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <BarChart3 size={20} />
            Reports
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Bell size={20} />
            Notifications
          </NavLink>

          <NavLink
            to="/ticket-history"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Clock size={20} />
            Ticket History
          </NavLink>
        </div>

        <div className="nav-section">
          <span className="nav-label">ACCOUNT</span>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <UserCircle size={20} />
            Profile
          </NavLink>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'A'}
          </div>

          <div className="user-details">
            <span className="user-name">
              {user?.name || 'Admin'}
            </span>

            <span className="user-role">
              {user?.role || 'Administrator'}
            </span>
          </div>
        </div>

        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;