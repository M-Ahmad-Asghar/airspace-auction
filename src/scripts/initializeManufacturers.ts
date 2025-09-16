import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { AIRCRAFT_MANUFACTURERS } from '@/lib/constants';

export async function initializeManufacturers(): Promise<void> {
  try {
    console.log('Initializing manufacturers...');
    
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    // Check if manufacturers collection already has data
    const existingQuery = query(collection(db, 'manufacturers'));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log('Manufacturers collection already has data. Skipping initialization.');
      return;
    }
    
    // Add each manufacturer
    for (const manufacturer of AIRCRAFT_MANUFACTURERS) {
      try {
        await addDoc(collection(db, 'manufacturers'), {
          name: manufacturer,
          createdBy: 'system',
          createdAt: new Date(),
        });
        console.log(`Added manufacturer: ${manufacturer}`);
      } catch (error) {
        console.error(`Error adding manufacturer ${manufacturer}:`, error);
      }
    }
    
    console.log('Manufacturers initialization completed!');
  } catch (error) {
    console.error('Error initializing manufacturers:', error);
  }
}
