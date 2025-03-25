import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <i className="fas fa-home"></i>
          <span>Dashboard</span>
        </Link>

        {user?.role === 'admin' && (
          <Link 
            to="/manage-users" 
            className={`nav-item ${isActive('/manage-users') ? 'active' : ''}`}
          >
            <i className="fas fa-users-cog"></i>
            <span>Manage Users</span>
          </Link>
        )}

        <Link 
          to="/patients" 
          className={`nav-item ${isActive('/patients') ? 'active' : ''}`}
        >
          <i className="fas fa-user-injured"></i>
          <span>Patients</span>
        </Link>

        <Link 
          to="/appointments" 
          className={`nav-item ${isActive('/appointments') ? 'active' : ''}`}
        >
          <i className="fas fa-calendar-alt"></i>
          <span>Appointments</span>
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
