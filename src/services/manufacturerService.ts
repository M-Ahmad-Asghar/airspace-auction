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

export interface Manufacturer {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
}

// Get all manufacturers from database
export async function getManufacturers(): Promise<Manufacturer[]> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const q = query(
      collection(db, 'manufacturers'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Manufacturer[];
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    throw error;
  }
}

// Search manufacturers by name
export async function searchManufacturers(searchTerm: string): Promise<Manufacturer[]> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const q = query(
      collection(db, 'manufacturers'),
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
    })) as Manufacturer[];
  } catch (error) {
    console.error('Error searching manufacturers:', error);
    throw error;
  }
}

// Add new manufacturer
export async function addManufacturer(name: string, userId: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    // Check if manufacturer already exists
    const existingQuery = query(
      collection(db, 'manufacturers'),
      where('name', '==', name)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error('Manufacturer already exists');
    }

    const manufacturerData = {
      name: name.trim(),
      createdBy: userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'manufacturers'), manufacturerData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding manufacturer:', error);
    throw error;
  }
}

// Check if manufacturer exists
export async function manufacturerExists(name: string): Promise<boolean> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const q = query(
      collection(db, 'manufacturers'),
      where('name', '==', name)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking manufacturer existence:', error);
    return false;
  }
}
