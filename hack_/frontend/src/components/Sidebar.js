import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, user }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <i className="fas fa-home"></i>
          <span>Dashboard</span>
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink 
            to="/admin" 
            className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
          >
            <i className="fas fa-users-cog"></i>
            <span>Manage Users</span>
          </NavLink>
        )}

        <NavLink 
          to="/patients" 
          className={`nav-link ${isActive('/patients') ? 'active' : ''}`}
        >
          <i className="fas fa-user-injured"></i>
          <span>Patients</span>
        </NavLink>

        <NavLink 
          to="/appointments" 
          className={`nav-link ${isActive('/appointments') ? 'active' : ''}`}
        >
          <i className="fas fa-calendar-check"></i>
          <span>Appointments</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar; 