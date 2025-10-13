import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { s3UploadService } from '../services/s3UploadService';
import '../Page.css';

function PrintingWithS3() {
  const navigate = useNavigate();
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
  const [uploadedPrintingImage, setUploadedPrintingImage] = useState(null);
  const [printingImageFileName, setPrintingImageFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadActions, setShowUploadActions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cleanup any ongoing processes when component unmounts
      if (uploadedPrintingImage) {
        URL.revokeObjectURL(uploadedPrintingImage);
      }
    };
  }, [uploadedPrintingImage]);

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

  const calculatePrintingDates = () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    try {
      const inputDate = new Date(selectedDate);
      
      // Validate the date
      if (isNaN(inputDate.getTime())) {
        alert('Please enter a valid date');
        return;
      }

      // Calculate dates based on the selected date
      const printingDate = new Date(inputDate);
      printingDate.setDate(printingDate.getDate() - 1); // Day before

      const packingDate = new Date(inputDate);
      packingDate.setDate(packingDate.getDate() - 2); // Two days before

      const bagMakingDate = new Date(inputDate);
      bagMakingDate.setDate(bagMakingDate.getDate() - 3); // Three days before

      // Create date info object
      const calculatedInfo = {
        selectedDate: inputDate,
        printingDate: printingDate,
        packingDate: packingDate,
        bagMakingDate: bagMakingDate,
        formattedDates: {
          selected: formatDate(inputDate),
          printing: formatDate(printingDate),
          packing: formatDate(packingDate),
          bagMaking: formatDate(bagMakingDate)
        },
        printingFilename: formatDate(printingDate, 'DDMMYY')
      };

      setDateInfo(calculatedInfo);
      setIsCalculated(true);
    } catch (error) {
      console.error('Error calculating dates:', error);
      alert('Error calculating dates. Please try again.');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Validate file type (images only) - this validation will also be done by S3 service
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (limit to 10MB) - this validation will also be done by S3 service
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image file is too large. Please select a file smaller than 10MB.');
      return;
    }

    // Clean up previous printing image if exists
    if (uploadedPrintingImage) {
      URL.revokeObjectURL(uploadedPrintingImage);
    }

    // Store the file and show preview with submit/cancel buttons
    setSelectedFile(file);
    setUploadedPrintingImage(URL.createObjectURL(file));
    setPrintingImageFileName(file.name);
    setShowUploadActions(true);
    setUploadResult(null); // Clear previous upload result
  };

  const handleSubmitUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Prepare metadata for the upload
      const metadata = {
        description: `Printing image for date: ${selectedDate}`,
        uploadedBy: 'current-user', // You can get this from your auth context
        // If you have a printing data record ID, you can include it here:
        // printingDataId: 'some-uuid'
      };

      // Upload using S3 service
      const result = await s3UploadService.uploadPrintingImage(selectedFile, metadata);

      // Success handling
      alert('Printing image uploaded successfully to S3!');
      console.log('File uploaded successfully:', result);
      
      // Store upload result for display
      setUploadResult(result);
      
      // Reset upload state
      setShowUploadActions(false);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    // Clean up and reset
    if (uploadedPrintingImage) {
      URL.revokeObjectURL(uploadedPrintingImage);
    }
    setUploadedPrintingImage(null);
    setPrintingImageFileName('');
    setSelectedFile(null);
    setShowUploadActions(false);
    setUploadResult(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewUploadedImage = async () => {
    if (uploadResult && uploadResult.fileName) {
      try {
        const signedUrl = await s3UploadService.getSignedUrl(uploadResult.fileName);
        window.open(signedUrl, '_blank');
      } catch (error) {
        console.error('Error getting signed URL:', error);
        alert('Could not load image. Please try again.');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Printing Calculations</h2>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Back to Dashboard
        </button>
      </div>
      
      <div className="content">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="selectedDate">Select Date:</label>
            <input
              type="date"
              id="selectedDate"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-input"
            />
          </div>
          
          <button onClick={calculatePrintingDates} className="calculate-button">
            Calculate Printing Dates
          </button>
        </div>

        {isCalculated && (
          <div className="results-section">
            <h3>Calculated Dates:</h3>
            <div className="date-results">
              <div className="date-item">
                <strong>Selected Date:</strong> {dateInfo.formattedDates?.selected}
              </div>
              <div className="date-item">
                <strong>Printing Date:</strong> {dateInfo.formattedDates?.printing}
              </div>
              <div className="date-item">
                <strong>Packing Date:</strong> {dateInfo.formattedDates?.packing}
              </div>
              <div className="date-item">
                <strong>Bag Making Date:</strong> {dateInfo.formattedDates?.bagMaking}
              </div>
            </div>
            
            {dateInfo.printingFilename && (
              <div className="filename-section">
                <h4>Suggested Printing Filename:</h4>
                <div className="filename-display">
                  <code>{dateInfo.printingFilename}.jpg</code>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="upload-section">
          <h3>Upload Printing Image (S3 Storage):</h3>
          <div className="upload-controls">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="upload-button"
              disabled={isUploading}
            >
              Select Printing Image
            </button>
          </div>

          {uploadedPrintingImage && (
            <div className="image-preview-section">
              <div className="image-preview">
                <img src={uploadedPrintingImage} alt="Printing preview" />
              </div>
              <div className="image-details">
                <p><strong>File:</strong> {printingImageFileName}</p>
              </div>
            </div>
          )}

          {showUploadActions && (
            <div className="upload-actions">
              <button 
                onClick={handleSubmitUpload} 
                className="submit-button"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading to S3...' : 'Upload to S3'}
              </button>
              <button 
                onClick={handleCancelUpload} 
                className="cancel-button"
                disabled={isUploading}
              >
                Cancel
              </button>
            </div>
          )}

          {uploadResult && (
            <div className="upload-success">
              <h4>✅ Upload Successful!</h4>
              <div className="upload-details">
                <p><strong>File URL:</strong> {uploadResult.imageUrl}</p>
                <p><strong>File Name:</strong> {uploadResult.fileName}</p>
                <p><strong>Size:</strong> {Math.round(uploadResult.size / 1024)} KB</p>
                <p><strong>Uploaded:</strong> {new Date(uploadResult.uploadedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                <button onClick={handleViewUploadedImage} className="view-button">
                  View Uploaded Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrintingWithS3;