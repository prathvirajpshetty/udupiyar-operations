// Hybrid data storage utility - tries Firestore first, falls back to localStorage
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

class DataStorage {
  // Try to save to Firestore, fallback to localStorage
  static async saveData(collectionName, data) {
    try {
      // Try Firestore first
      const docRef = await addDoc(collection(db, collectionName), data);
      
      return {
        success: true,
        id: docRef.id,
        method: 'firestore'
      };
    } catch (error) {
      // Fallback to localStorage
      try {
        const storageKey = `${collectionName}_data`;
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const newEntry = {
          ...data,
          id: Date.now().toString(), // Simple ID generation
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
        throw new Error('Failed to save data to both Firestore and localStorage');
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
