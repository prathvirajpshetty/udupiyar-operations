// Backend API data storage utility
class DataStorage {
  static async saveData(endpoint, data) {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        id: result.data.id,
        data: result.data,
        method: 'backend'
      };
    } catch (error) {
      // Fallback to localStorage for offline support
      try {
        const storageKey = `${endpoint}_data`;
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const newEntry = {
          ...data,
          id: Date.now().toString(),
          savedAt: new Date().toISOString(),
          method: 'localStorage'
        };
        
        existingData.push(newEntry);
        localStorage.setItem(storageKey, JSON.stringify(existingData));
        
        return {
          success: true,
          id: newEntry.id,
          method: 'localStorage'
        };
      } catch (localError) {
        throw new Error('Failed to save data to both backend and localStorage');
      }
    }
  }

  // Get all data from localStorage (for viewing saved data)
  static getLocalData(collectionName) {
    try {
      const storageKey = `${collectionName}_data`;
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  // Clear localStorage data (for testing)
  static clearLocalData(collectionName) {
    const storageKey = `${collectionName}_data`;
    localStorage.removeItem(storageKey);
  }
}

export default DataStorage;
