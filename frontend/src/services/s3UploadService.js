// S3 Upload Service for Batch Code Images
// Backend integration for S3 file upload functionality

class S3UploadService {
  constructor() {
    // Use environment variable for backend URL, fallback to localhost
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    
    // S3 upload endpoint
    this.uploadEndpoint = `${this.baseURL}/api/upload/batch-code-image`;
  }

  async uploadBatchCodeImage(file, metadata = {}) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    // Validate file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Image file is too large. Please select a file smaller than 10MB.');
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', file);
    
    // Add all batch code data metadata
    if (metadata.batchCodeDataId) {
      formData.append('batchCodeDataId', metadata.batchCodeDataId);
    }
    
    if (metadata.selectedDate) {
      formData.append('selectedDate', metadata.selectedDate);
    }
    
    if (metadata.calculatedDates) {
      formData.append('calculatedDates', JSON.stringify(metadata.calculatedDates));
    }
    
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    
    if (metadata.uploadedBy) {
      formData.append('uploadedBy', metadata.uploadedBy);
    }

    if (metadata.user) {
      formData.append('user', metadata.user);
    }

    try {
      const response = await fetch(this.uploadEndpoint, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it for FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      return result.data;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  // Additional service methods for batch code data management
  async getBatchCodeData(date) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-code-data?date=${date}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get batch code data: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get Batch Code Data Error:', error);
      throw error;
    }
  }

  async deleteBatchCodeData(id) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-code-data/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete batch code data: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete Batch Code Data Error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const s3UploadService = new S3UploadService();

// Helper function to create Indian timezone filename
export const createIndianTimestampFilename = (originalFileName) => {
  // Create filename with Indian date and time format
  const now = new Date();
  
  // Convert to Indian timezone (IST)
  const indianTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  
  // Format date as DD-MM-YYYY
  const day = String(indianTime.getDate()).padStart(2, '0');
  const month = String(indianTime.getMonth() + 1).padStart(2, '0');
  const year = indianTime.getFullYear();
  const hours = String(indianTime.getHours()).padStart(2, '0');
  const minutes = String(indianTime.getMinutes()).padStart(2, '0');
  const seconds = String(indianTime.getSeconds()).padStart(2, '0');
  
  // Get file extension
  const fileExtension = originalFileName ? originalFileName.split('.').pop() : 'jpg';
  
  // Create filename: DD-MM-YYYY_HH-MM-SS.ext
  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}.${fileExtension}`;
};