import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RawMaterial from './components/RawMaterial';
import Printing from './components/Printing';
import DataEntry from './components/DataEntry';
import SalesData from './components/SalesData';
import ProductionData from './components/ProductionData';
import UserHeader from './components/UserHeader';
import './App.css';

function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Check if user is admin or raghu to show Data Entry button
  const canAccessDataEntry = currentUser && 
    (currentUser.username === 'admin' || currentUser.username === 'raghu');

  return (
    <div className="App">
      <UserHeader />
      <header className="App-header">
        <button 
          className="top-button" 
          onClick={() => navigate('/raw-material')}
        >
          RAW MATERIAL
        </button>
        <button 
          className="bottom-button" 
          onClick={() => navigate('/printing')}
        >
          PRINTING
        </button>
        {canAccessDataEntry && (
          <button 
            className="bottom-button" 
            onClick={() => navigate('/data-entry')}
            style={{ marginTop: '20px' }}
          >
            DATA ENTRY
          </button>
        )}
      </header>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/raw-material" element={<RawMaterial />} />
            <Route path="/printing" element={<Printing />} />
            <Route path="/data-entry" element={<DataEntry />} />
            <Route path="/sales-data" element={<SalesData />} />
            <Route path="/production-data" element={<ProductionData />} />
          </Routes>
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;
