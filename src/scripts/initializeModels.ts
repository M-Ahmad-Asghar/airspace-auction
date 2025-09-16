import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { AIRCRAFT_MODELS } from '@/lib/constants';

export async function initializeModels(): Promise<void> {
  try {
    console.log('Initializing models...');
    
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    
    // Check if models collection already has data
    const existingQuery = query(collection(db, 'models'));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log('Models collection already has data. Skipping initialization.');
      return;
    }
    
    // Add each model
    for (const model of AIRCRAFT_MODELS) {
      try {
        await addDoc(collection(db, 'models'), {
          name: model,
          createdBy: 'system',
          createdAt: new Date(),
        });
        console.log(`Added model: ${model}`);
      } catch (error) {
        console.error(`Error adding model ${model}:`, error);
      }
    }
    
    console.log('Models initialization completed!');
  } catch (error) {
    console.error('Error initializing models:', error);
  }
}
