import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Page.css';

function RawMaterial() {
  const navigate = useNavigate();
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [results, setResults] = useState({});

  const calculateWeights = () => {
    const inputValue = parseFloat(estimatedWeight);
    if (isNaN(inputValue) || inputValue <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    const halfInput = inputValue / 2;
    
    const dosaRice = halfInput * 0.674;
    const idlyRice = halfInput * 0.076;
    const uradDal = halfInput * 0.250;
    const fenugreek = halfInput * 0.003;
    
    // SALT calculation: (ADD all the value * 1.5) * 0.0085
    const totalBeforeSalt = dosaRice + idlyRice + uradDal + fenugreek;
    const salt = (totalBeforeSalt * 1.5) * 0.0085;
    
    // Calculate total weight
    const totalWeight = (dosaRice + idlyRice + uradDal + fenugreek + salt) * 2;

    setResults({
      dosaRice: dosaRice.toFixed(3),
      idlyRice: idlyRice.toFixed(3),
      uradDal: uradDal.toFixed(3),
      fenugreek: fenugreek.toFixed(3),
      salt: salt.toFixed(3),
      totalWeight: totalWeight.toFixed(3)
    });

    setIsCalculated(true);
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Raw Material</h1>
      </div>
      
      {!isCalculated ? (
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="weight">Estimated Weight:</label>
            <input
              type="number"
              id="weight"
              value={estimatedWeight}
              onChange={(e) => setEstimatedWeight(e.target.value)}
              placeholder="Enter weight"
              className="weight-input"
            />
          </div>
          <div className="button-group">
            <button className="calculate-button" onClick={calculateWeights}>
              Calculate
            </button>
            <button className="back-button" onClick={goBack}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <div className="results-grid">
            <div className="result-item">
              <span className="item-name">DOSA RICE</span>
              <span className="item-weight">{results.dosaRice} kg</span>
            </div>
            <div className="result-item">
              <span className="item-name">IDLY RICE</span>
              <span className="item-weight">{results.idlyRice} kg</span>
            </div>
            <div className="result-item">
              <span className="item-name">URAD DAL</span>
              <span className="item-weight">{results.uradDal} kg</span>
            </div>
            <div className="result-item">
              <span className="item-name">FENUGREEK</span>
              <span className="item-weight">{results.fenugreek} kg</span>
            </div>
            <div className="result-item">
              <span className="item-name">SALT</span>
              <span className="item-weight">{results.salt} kg</span>
            </div>
            <div className="result-item">
              <span className="item-name">TOTAL WEIGHT</span>
              <span className="item-weight">{results.totalWeight} kg</span>
            </div>
          </div>
          
          <div className="input-section">
            <div className="input-group">
              <label htmlFor="weight">Estimated Weight:</label>
              <input
                type="number"
                id="weight"
                value={estimatedWeight}
                onChange={(e) => setEstimatedWeight(e.target.value)}
                placeholder="Enter weight"
                className="weight-input"
              />
            </div>
            <button className="calculate-button" onClick={calculateWeights}>
              Calculate
            </button>
          </div>
          
          <div className="button-group">
            <button className="back-button" onClick={goBack}>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RawMaterial;