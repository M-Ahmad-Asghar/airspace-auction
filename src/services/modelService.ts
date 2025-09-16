import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

export interface Model {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
}

// Get all models from database
export async function getModels(): Promise<Model[]> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const q = query(
      collection(db, 'models'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Model[];
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

// Search models by name
export async function searchModels(searchTerm: string): Promise<Model[]> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const q = query(
      collection(db, 'models'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      orderBy('name', 'asc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Model[];
  } catch (error) {
    console.error('Error searching models:', error);
    throw error;
  }
}

// Add new model
export async function addModel(name: string, userId: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    // Check if model already exists
    const existingQuery = query(
      collection(db, 'models'),
      where('name', '==', name)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error('Model already exists');
    }

    const modelData = {
      name: name.trim(),
      createdBy: userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'models'), modelData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding model:', error);
    throw error;
  }
}

// Check if model exists
export async function modelExists(name: string): Promise<boolean> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const q = query(
      collection(db, 'models'),
      where('name', '==', name)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking model existence:', error);
    return false;
  }
}
