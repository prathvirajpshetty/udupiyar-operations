import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { s3UploadService } from '../services/s3UploadService';
import DataStorage from '../utils/DataStorage';
import '../Page.css';

function BatchCodePrint() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    // Get current date in Indian timezone more reliably
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const indianTime = new Date(utc + (5.5 * 3600000)); // IST is UTC+5:30
    
    const year = indianTime.getFullYear();
    const month = String(indianTime.getMonth() + 1).padStart(2, '0');
    const day = String(indianTime.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  });
  const [isCalculated, setIsCalculated] = useState(false);
  const [dateInfo, setDateInfo] = useState({});
  const [uploadedBatchCodeImage, setUploadedBatchCodeImage] = useState(null);
  const [batchCodeImageFileName, setBatchCodeImageFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadActions, setShowUploadActions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cleanup any ongoing processes when component unmounts
      if (uploadedBatchCodeImage) {
        URL.revokeObjectURL(uploadedBatchCodeImage);
      }
    };
  }, [uploadedBatchCodeImage]);

  // Ensure date is always current on component mount
  useEffect(() => {
    const getCurrentIndianDate = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const indianTime = new Date(utc + (5.5 * 3600000)); // IST is UTC+5:30
      
      const year = indianTime.getFullYear();
      const month = String(indianTime.getMonth() + 1).padStart(2, '0');
      const day = String(indianTime.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };
    
    const currentDate = getCurrentIndianDate();
    setSelectedDate(currentDate);
  }, []);

  // Validate date input
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    
    // Basic validation
    if (newDate) {
      const dateObj = new Date(newDate);
      if (!isNaN(dateObj.getTime())) {
        setSelectedDate(newDate);
        
        // Clear previous calculations when date changes
        if (isCalculated) {
          // Date changed, user should recalculate
        }
      }
    } else {
      setSelectedDate(newDate);
    }
  };

  const formatDate = (date, format = 'DD.MM.YY') => {
    try {
      const d = new Date(date);
      
      // Check if date is valid
      if (isNaN(d.getTime())) {
        throw new Error('Invalid date');
      }
      
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      
      if (format === 'DD.MM.YY') {
        return `${day}.${month}.${year}`;
      } else if (format === 'DDMMYY') {
        return `${day}${month}${year}`;
      }
      
      return `${day}.${month}.${year}`; // default fallback
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const calculateDates = () => {
    try {
      // Validate input date
      if (!selectedDate) {
        alert('Please select a valid date');
        return;
      }
      
      const selectedDateObj = new Date(selectedDate);
      
      // Check if the selected date is valid
      if (isNaN(selectedDateObj.getTime())) {
        alert('Please select a valid date');
        return;
      }
      
      // Check if date is too far in the past or future (reasonable range)
      const currentYear = new Date().getFullYear();
      const selectedYear = selectedDateObj.getFullYear();
      
      if (selectedYear < currentYear - 1 || selectedYear > currentYear + 10) {
        alert('Please select a date within a reasonable range');
        return;
      }
      
      // PKD date = tomorrow (MFG date)
      const pkdDate = new Date(selectedDateObj);
      pkdDate.setDate(pkdDate.getDate() + 1);
      
      // USE BY date = selected date + 9 days (total 10 days from selected)
      const useByDate = new Date(selectedDateObj);
      useByDate.setDate(useByDate.getDate() + 8);
      
      // Batch code = 1(SELECTEDDATE in DDMMYY)26
      const batchCode = `1${formatDate(selectedDateObj, 'DDMMYY')}26`;
      
      // Validate that all dates were calculated correctly
      if (formatDate(pkdDate) === 'Invalid Date' || 
          formatDate(useByDate) === 'Invalid Date' || 
          batchCode.includes('Invalid Date')) {
        alert('Error calculating dates. Please try again.');
        return;
      }
      
      const line1 = "RS: 80";
      const line2 = `PKD: ${formatDate(pkdDate)}`;
      const line3 = `USE BY: ${formatDate(useByDate)}`;
      
      setDateInfo({
        line1: line1,
        line2: line2,
        line3: line3,
        batchCode: batchCode,
        expectedText: `${line1}\n${line2}\n${line3}\nBatch: ${batchCode}`,
        selectedDate: selectedDate,
        pkdDate: pkdDate.toISOString().split('T')[0],
        useByDate: useByDate.toISOString().split('T')[0]
      });
      
      setIsCalculated(true);
      // Dates calculated successfully
      
    } catch (error) {
      console.error('Error in calculateDates:', error);
      alert('An error occurred while calculating dates. Please try again.');
    }
  };

  const handleUploadProof = () => {
    // Reset file input to allow same file to be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Trigger file input click to upload batch code image
    fileInputRef.current.click();
  };

    const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image file is too large. Please select a file smaller than 10MB.');
      return;
    }

    // Clean up previous batch code image if exists
    if (uploadedBatchCodeImage) {
      URL.revokeObjectURL(uploadedBatchCodeImage);
    }

    // Store the file and show preview with submit/cancel buttons
    setSelectedFile(file);
    setUploadedBatchCodeImage(URL.createObjectURL(file));
    setBatchCodeImageFileName(file.name);
    setShowUploadActions(true);
  };

  const handleSubmitUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // First save the batch code print data to backend
      const batchCodePrintData = {
        selectedDate,
        calculatedDates: dateInfo,
        user: currentUser?.username || 'anonymous',
        timestamp: new Date().toISOString()
      };

      // Save batch code print data first
      const batchCodePrintResult = await DataStorage.saveData('batch-code-print', batchCodePrintData);

      // Upload image to S3 with batch code data
      const uploadResult = await s3UploadService.uploadBatchCodeImage(selectedFile, {
        batchCodeDataId: batchCodePrintResult.id,
        selectedDate: selectedDate,
        calculatedDates: dateInfo,
        description: `Batch code image for ${selectedDate}`,
        uploadedBy: currentUser?.username || 'anonymous'
      });

      alert('Batch code print data and batch code image uploaded successfully!');
      
      // Reset upload state
      setShowUploadActions(false);
      setSelectedFile(null);
      setUploadedBatchCodeImage(null);
      setBatchCodeImageFileName('');
      
    } catch (error) {
      console.error('Error uploading:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    // Clean up and reset
    if (uploadedBatchCodeImage) {
      URL.revokeObjectURL(uploadedBatchCodeImage);
    }
    setUploadedBatchCodeImage(null);
    setBatchCodeImageFileName('');
    setSelectedFile(null);
    setShowUploadActions(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Batch Code Print</h1>
      </div>
      
      {!isCalculated ? (
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="date">Select Date:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-input"
              min="2020-01-01"
              max="2040-12-31"
            />
          </div>
          <div className="button-group">
            <button className="calculate-button" onClick={calculateDates}>
              Calculate
            </button>
            <button className="back-button" onClick={goBack}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <div className="date-results">
            <div className="date-item">
              <span className="date-value">{dateInfo.line1}</span>
            </div>
            <div className="date-item">
              <span className="date-value">{dateInfo.line2}</span>
            </div>
            <div className="date-item">
              <span className="date-value">{dateInfo.line3}</span>
            </div>
            <div className="date-item">
              <span className="date-label">Batch Code:</span>
              <span className="date-value">{dateInfo.batchCode}</span>
            </div>
          </div>

          <div className="upload-batch-code-image-section">
            {!showUploadActions ? (
              <button 
                className="upload-button" 
                onClick={handleUploadProof}
                style={{ padding: '20px', margin: '20px' }}
              >
                UPLOAD BATCH CODE IMAGE
              </button>
            ) : (
              <div className="upload-actions">
                <div className="upload-result">
                  <p style={{
                    color: '#2d5a27',
                    backgroundColor: '#e8f5e8',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #4caf50',
                    margin: '10px 0',
                    fontWeight: 'bold'
                  }}>📎 Selected: {batchCodeImageFileName}</p>
                  {uploadedBatchCodeImage && (
                    <div className="batch-code-image-preview">
                      <img 
                        src={uploadedBatchCodeImage} 
                        alt="Batch code image preview" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '200px', 
                          objectFit: 'contain',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          marginBottom: '15px'
                        }} 
                      />
                    </div>
                  )}
                  
                  <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                      className="submit-button" 
                      onClick={handleSubmitUpload}
                      disabled={isUploading}
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {isUploading ? 'Uploading...' : 'Submit'}
                    </button>
                    <button 
                      className="cancel-button" 
                      onClick={handleCancelUpload}
                      disabled={isUploading}
                      style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
            />
          </div>

          <div className="input-section">
            <div className="input-group">
              <label htmlFor="date">Select Date:</label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="date-input"
                min="2020-01-01"
                max="2040-12-31"
              />
            </div>
            <button className="calculate-button" onClick={calculateDates}>
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

export default BatchCodePrint;
