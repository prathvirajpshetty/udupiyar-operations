import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../Page.css';

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      
      // Call backend authentication API
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Successful login
        login({
          username: result.user.username,
          role: result.user.role,
          id: result.user.id,
          loginTime: new Date().toISOString()
        });
      } else {
        setError(result.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="login-container" style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '30px', color: '#333' }}>
          Udupiyar Operations
        </h1>
        <h2 style={{ marginBottom: '30px', color: '#666', fontWeight: 'normal' }}>
          Please Login
        </h2>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your username"
            />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div style={{
              color: '#f44336',
              backgroundColor: '#ffebee',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '1px solid #f44336'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: isLoading ? '#ccc' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
