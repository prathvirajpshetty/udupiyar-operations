import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import RawMaterial from './RawMaterial';
import Printing from './Printing';
import './App.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="App">
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
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/raw-material" element={<RawMaterial />} />
        <Route path="/printing" element={<Printing />} />
      </Routes>
    </Router>
  );
}

export default App;
