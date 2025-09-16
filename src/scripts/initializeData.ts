import { initializeManufacturers } from './initializeManufacturers';
import { initializeModels } from './initializeModels';

export async function initializeAllData(): Promise<void> {
  try {
    console.log('Starting data initialization...');
    
    // Initialize manufacturers first
    await initializeManufacturers();
    
    // Then initialize models
    await initializeModels();
    
    console.log('All data initialization completed!');
  } catch (error) {
    console.error('Error during data initialization:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeAllData();
}
