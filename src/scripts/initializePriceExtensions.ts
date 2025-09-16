import { addPriceExtension } from '@/services/priceExtensionService';

const DEFAULT_PRICE_EXTENSIONS = [
  'Starting Bid',
  'OBO',
  'Reduced Price',
  'Make An Offer',
  'FREE'
];

export async function initializePriceExtensions() {
  console.log('Initializing price extensions...');
  
  for (const extension of DEFAULT_PRICE_EXTENSIONS) {
    try {
      await addPriceExtension(extension, 'system');
      console.log(`Added price extension: ${extension}`);
    } catch (error) {
      console.error(`Failed to add price extension ${extension}:`, error);
    }
  }
  
  console.log('Price extensions initialization complete!');
}

// Run if called directly
if (require.main === module) {
  initializePriceExtensions().catch(console.error);
}
