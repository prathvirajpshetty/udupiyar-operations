import React from 'react';
import { useAuth } from '../context/AuthContext';

function UserHeader() {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      right: '0',
      zIndex: '1000',
      padding: '10px 20px'
    }}>
      <button
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
      >
        Logout
      </button>
    </div>
  );
}

export default UserHeader;
