import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ toggleSidebar, user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="navbar-brand">Healthcare Management</h1>
      </div>
      
      <div className="navbar-right">
        {user && (
          <>
            <span className="user-info">
              <i className="fas fa-user"></i>
              {user.name}
            </span>
            <button className="btn btn-outline" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 