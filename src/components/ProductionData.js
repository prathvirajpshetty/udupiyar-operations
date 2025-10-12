import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DataStorage from '../utils/DataStorage';
import UserHeader from './UserHeader';
import '../Page.css';
import { Timestamp } from "firebase/firestore";


function ProductionData() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Simple local date for form input
    pouches: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for storage
      const productionData = {
        ...formData,
        pouches: parseInt(formData.pouches) || 0,
        user: currentUser?.username,
        timestamp: Timestamp.fromDate(new Date()) // stores current local time
      };

      // Use hybrid storage (Firestore with localStorage fallback)
      const result = await DataStorage.saveData('production', productionData);
      
      const storageMethod = result.method === 'firestore' ? 'cloud database' : 'local storage';
      alert(`Production data submitted successfully to ${storageMethod}!`);
      
      navigate('/data-entry');
    } catch (error) {
      alert(`Failed to submit production data: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/data-entry');
  };

  return (
    <div className="page-container">
      <UserHeader />
      <div className="page-header">
        <h1>Production Data Entry</h1>
      </div>
      
      <div className="input-section">
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="date" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Date:
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="date-input"
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '30px' }}>
            <label htmlFor="pouches" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Number of Pouches:
            </label>
            <input
              type="number"
              id="pouches"
              name="pouches"
              value={formData.pouches}
              onChange={handleInputChange}
              required
              min="0"
              step="1"
              style={{ width: '100%', padding: '10px' }}
              placeholder="Enter number of pouches"
            />
          </div>

          <div className="button-group" style={{ 
            display: 'flex', 
            gap: '15px', 
            justifyContent: 'center' 
          }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 25px',
                backgroundColor: isSubmitting ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                padding: '12px 25px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductionData;
