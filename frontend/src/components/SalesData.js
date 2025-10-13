import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DataStorage from '../utils/DataStorage';
import UserHeader from './UserHeader';
import '../Page.css';

function SalesData() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: (() => {
      // Get current date in Indian timezone
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const indianTime = new Date(utc + (5.5 * 3600000));
      const year = indianTime.getFullYear();
      const month = String(indianTime.getMonth() + 1).padStart(2, '0');
      const day = String(indianTime.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    sold: '',
    exchange: '',
    return: '',
    amount: '',
    regularSale: true,
    comment: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'select-one' && name === 'regularSale' ? value === 'true' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for storage
      const salesData = {
        ...formData,
        sold: parseFloat(formData.sold) || 0,
        exchange: parseFloat(formData.exchange) || 0,
        return: parseFloat(formData.return) || 0,
        amount: parseFloat(formData.amount) || 0,
        regularSale: formData.regularSale,
        user: currentUser?.username,
        timestamp: new Date().toISOString()
      };

      // Save to backend API
      const result = await DataStorage.saveData('sales', salesData);
      
      const storageMethod = result.method === 'backend' ? 'database' : 'local storage';
      alert(`Sales data submitted successfully to ${storageMethod}!`);
      
      navigate('/data-entry');
    } catch (error) {
      alert(`Failed to submit sales data: ${error.message}`);
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
        <h1>Sales Data Entry</h1>
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

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="sold" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Sold:
            </label>
            <input
              type="number"
              id="sold"
              name="sold"
              value={formData.sold}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              style={{ width: '100%', padding: '10px' }}
              placeholder="Enter sold amount"
            />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="exchange" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Exchange:
            </label>
            <input
              type="number"
              id="exchange"
              name="exchange"
              value={formData.exchange}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              style={{ width: '100%', padding: '10px' }}
              placeholder="Enter exchange amount"
            />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="return" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Return:
            </label>
            <input
              type="number"
              id="return"
              name="return"
              value={formData.return}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              style={{ width: '100%', padding: '10px' }}
              placeholder="Enter return amount"
            />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="amount" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Amount:
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              style={{ width: '100%', padding: '10px' }}
              placeholder="Enter amount"
            />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="regularSale" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Regular Sale:
            </label>
            <select
              id="regularSale"
              name="regularSale"
              value={formData.regularSale}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px' }}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: '30px' }}>
            <label htmlFor="comment" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Comment:
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows="3"
              style={{ 
                width: '100%', 
                padding: '10px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              placeholder="Enter any comments (optional)"
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

export default SalesData;
