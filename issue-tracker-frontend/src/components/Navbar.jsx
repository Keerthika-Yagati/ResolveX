import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // Define menus based on role
  const getMenus = () => {
    if (!user) return [];
    
    switch(user.role) {
      case 1: // User
        return [
          { path: '/dashboard', name: 'Dashboard', icon: '🏠' },
          { path: '/my-issues', name: 'My Issues', icon: '📋' },
          { path: '/create-issue', name: 'Create Issue', icon: '➕' },
          { path: '/notifications', name: 'Notifications', icon: '🔔' },
          { path: '/profile', name: 'Profile', icon: '👤' }
        ];
      case 2: // Developer
        return [
          { path: '/dashboard', name: 'Dashboard', icon: '🏠' },
          { path: '/assigned-issues', name: 'My Tasks', icon: '✅' },
          { path: '/notifications', name: 'Notifications', icon: '🔔' },
          { path: '/profile', name: 'Profile', icon: '👤' }
        ];
      case 3: // Admin
        return [
          { path: '/dashboard', name: 'Dashboard', icon: '🏠' },
          { path: '/all-issues', name: 'All Issues', icon: '📊' },
          { path: '/user-manager', name: 'User Manager', icon: '👥' },
          { path: '/notifications', name: 'Notifications', icon: '🔔' },
          { path: '/profile', name: 'Profile', icon: '👤' }
        ];
      default:
        return [{ path: '/dashboard', name: 'Dashboard', icon: '🏠' }];
    }
  };

  const menus = getMenus();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getRoleName = (role) => {
    switch(role) {
      case 1: return 'User';
      case 2: return 'Developer';
      case 3: return 'Admin';
      default: return 'Guest';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">ResolveX</span>
        </div>
        <div className="tagline">Track • Manage • Resolve</div>
      </div>

      <div className="sidebar-nav">
        {menus.map((menu, index) => (
          <Link
            key={index}
            to={menu.path}
            className={`nav-item ${location.pathname === menu.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{menu.icon}</span>
            <span className="nav-text">{menu.name}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-info-sidebar">
          <div className="user-avatar">
            {getInitials(user.fullname)}
          </div>
          <div className="user-details">
            <div className="user-name">{user.fullname}</div>
            <div className="user-role">{getRoleName(user.role)}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
           Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;