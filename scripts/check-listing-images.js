const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
const serviceAccount = require('./path-to-your-service-account-key.json'); // Update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com" // Update this URL
});

const db = admin.firestore();

async function checkListingImages() {
  try {
    console.log('Fetching all listings to check images...');
    const listingsSnapshot = await db.collection('listings').get();
    
    if (listingsSnapshot.empty) {
      console.log('No listings found.');
      return;
    }

    console.log(`Found ${listingsSnapshot.size} listings. Checking images...\n`);

    listingsSnapshot.forEach((doc) => {
      const listing = doc.data();
      console.log(`Listing ID: ${doc.id}`);
      console.log(`Title: ${listing.title || 'No title'}`);
      console.log(`Category: ${listing.category || 'No category'}`);
      console.log(`Images field: ${listing.images ? 'EXISTS' : 'MISSING'}`);
      console.log(`ImageUrls field: ${listing.imageUrls ? 'EXISTS' : 'MISSING'}`);
      
      if (listing.images && Array.isArray(listing.images)) {
        console.log(`Images array length: ${listing.images.length}`);
        listing.images.forEach((img, index) => {
          console.log(`  Image ${index + 1}: ${img}`);
        });
      }
      
      if (listing.imageUrls && Array.isArray(listing.imageUrls)) {
        console.log(`ImageUrls array length: ${listing.imageUrls.length}`);
        listing.imageUrls.forEach((img, index) => {
          console.log(`  ImageUrl ${index + 1}: ${img}`);
        });
      }
      
      console.log('---\n');
    });
    
  } catch (error) {
    console.error('Error checking listing images:', error);
  }
}

// Run the script
checkListingImages().then(() => {
  console.log('Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
