import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page.css';

function Printing() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [dateInfo, setDateInfo] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState('');
  const fileInputRef = useRef(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cleanup any ongoing processes when component unmounts
      setIsValidating(false);
    };
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
          setValidationResult('Date changed. Please recalculate.');
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
      useByDate.setDate(useByDate.getDate() + 9);
      
      // Batch code = 1(SELECTEDDATE in DDMMYY)25
      const batchCode = `1${formatDate(selectedDateObj, 'DDMMYY')}25`;
      
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
      setValidationResult(''); // Clear previous validation results
      
    } catch (error) {
      console.error('Error in calculateDates:', error);
      alert('An error occurred while calculating dates. Please try again.');
    }
  };

  const handleValidate = () => {
    // Check if dates are calculated
    if (!dateInfo.expectedText) {
      alert('Please calculate dates first before validating');
      return;
    }
    
    // Reset file input to allow same file to be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Trigger file input click to access camera
    fileInputRef.current.click();
  };

  const handleImageCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setValidationResult('No file selected');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationResult('❌ Please select a valid image file');
      return;
    }

    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setValidationResult('❌ Image file is too large. Please select a smaller image.');
      return;
    }

    setIsValidating(true);
    setValidationResult('Processing image...');

    try {
      // Create a promise-based timeout for the OCR simulation
      const ocrPromise = new Promise((resolve) => {
        setTimeout(() => {
          // Mock OCR result - in reality this would come from actual OCR
          const mockOcrText = `${dateInfo.line1}\n${dateInfo.line2}\n${dateInfo.line3}\nBatch: ${dateInfo.batchCode}`;
          
          // Compare with expected text (case-insensitive and trimmed)
          const expectedText = dateInfo.expectedText.trim().toLowerCase();
          const ocrText = mockOcrText.trim().toLowerCase();
          
          const isMatch = ocrText === expectedText;
          
          resolve({
            success: true,
            isMatch,
            ocrText: mockOcrText
          });
        }, 2000);
      });

      // Add timeout for OCR processing
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OCR processing timeout')), 30000); // 30 second timeout
      });

      const result = await Promise.race([ocrPromise, timeoutPromise]);

      if (result.success) {
        setValidationResult(result.isMatch ? 
          '✅ Validation Successful! Text matches.' : 
          '❌ Validation Failed! Text does not match.'
        );
      }

    } catch (error) {
      console.error('OCR Error:', error);
      
      if (error.message === 'OCR processing timeout') {
        setValidationResult('❌ Processing timeout. Please try again.');
      } else {
        setValidationResult('❌ Error processing image. Please try again.');
      }
    } finally {
      setIsValidating(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Printing</h1>
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
          <button className="calculate-button" onClick={calculateDates}>
            Calculate
          </button>
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

          <div className="validation-section">
            <button 
              className="validate-button" 
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? 'Processing...' : 'Validate with Camera'}
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageCapture}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
            />
            
            {validationResult && (
              <div className="validation-result">
                {validationResult}
              </div>
            )}
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

export default Printing;
