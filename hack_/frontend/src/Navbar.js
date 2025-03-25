import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">Doctor Assistant</Link>
      </div>
      
      <div className="navbar-menu">
        <button className="menu-toggle">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link>
          {user?.role === 'admin' && <Link to="/manage-users">Manage Users</Link>}
          <Link to="/patients">Patients</Link>
          <Link to="/appointments">Appointments</Link>
        </div>

        <div className="navbar-user">
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.username}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
