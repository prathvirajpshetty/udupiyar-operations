import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from './UserHeader';
import '../Page.css';

function DataEntry() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <UserHeader />
      <div className="page-header">
        <h1>Data Entry</h1>
      </div>
      
      <div className="input-section">
        <div className="button-group" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          alignItems: 'center',
          padding: '40px 20px'
        }}>
          <button 
            className="top-button" 
            onClick={() => navigate('/sales-data')}
            style={{
              padding: '20px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            SALES DATA
          </button>
          
          <button 
            className="bottom-button" 
            onClick={() => navigate('/production-data')}
            style={{
              padding: '20px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            PRODUCTION DATA
          </button>
          
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataEntry;
