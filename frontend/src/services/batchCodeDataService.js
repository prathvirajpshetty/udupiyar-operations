// Batch Code Data API Service
// Handles all batch code data operations with the single table

class BatchCodeDataService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  }

  // Create new batch code data record (without image)
  async createBatchCodeData(data) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-code-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create batch code data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create Batch Code Data Error:', error);
      throw error;
    }
  }

  // Get batch code data by date
  async getBatchCodeDataByDate(date) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-code-data?date=${date}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get batch code data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get Batch Code Data Error:', error);
      throw error;
    }
  }

  // Get all batch code data with optional pagination
  async getAllBatchCodeData(page = 1, limit = 20) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-code-data?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get batch code data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get All Batch Code Data Error:', error);
      throw error;
    }
  }

  // Update batch code data
  async updateBatchCodeData(id, updates) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-code-data/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update batch code data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update Batch Code Data Error:', error);
      throw error;
    }
  }

  // Delete batch code data record
  async deleteBatchCodeData(id) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-code-data/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete batch code data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete Batch Code Data Error:', error);
      throw error;
    }
  }

  // Search batch code data
  async searchBatchCodeData(query) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-code-data/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search Batch Code Data Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const batchCodeDataService = new BatchCodeDataService();
export default BatchCodeDataService;