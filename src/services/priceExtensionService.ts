import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';

export async function getPriceExtensions(): Promise<string[]> {
  try {
    const priceExtensionsRef = collection(db, 'priceExtensions');
    const q = query(priceExtensionsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data().name);
  } catch (error) {
    console.error('Error fetching price extensions:', error);
    return [];
  }
}

export async function searchPriceExtensions(searchTerm: string): Promise<string[]> {
  try {
    const priceExtensionsRef = collection(db, 'priceExtensions');
    const q = query(priceExtensionsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const allExtensions = querySnapshot.docs.map(doc => doc.data().name);
    return allExtensions.filter(extension => 
      extension.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching price extensions:', error);
    return [];
  }
}

export async function addPriceExtension(name: string, userId: string): Promise<void> {
  try {
    const priceExtensionsRef = collection(db, 'priceExtensions');
    await addDoc(priceExtensionsRef, {
      name: name.trim(),
      createdBy: userId,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error adding price extension:', error);
    throw error;
  }
}

export async function priceExtensionExists(name: string): Promise<boolean> {
  try {
    const priceExtensionsRef = collection(db, 'priceExtensions');
    const q = query(priceExtensionsRef, where('name', '==', name.trim()));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking price extension existence:', error);
    return false;
  }
}
