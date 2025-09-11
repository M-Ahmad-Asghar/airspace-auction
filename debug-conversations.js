const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Initialize Firebase (you'll need to replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugConversations() {
  try {
    console.log('Fetching all conversations...');
    const conversationsSnapshot = await getDocs(collection(db, 'conversations'));
    
    console.log(`Found ${conversationsSnapshot.size} conversations:`);
    conversationsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Ad Owner: ${data.adOwnerId} (${data.adOwnerName})`);
      console.log(`  Customer: ${data.customerId} (${data.customerName})`);
      console.log(`  Listing: ${data.listingId} (${data.listingTitle})`);
      console.log(`  Last Message: ${data.lastMessage?.content || 'None'}`);
      console.log(`  Unread Count: ${data.unreadCount || 0}`);
      console.log('---');
    });

    console.log('\nFetching all messages...');
    const messagesSnapshot = await getDocs(collection(db, 'messages'));
    
    console.log(`Found ${messagesSnapshot.size} messages:`);
    messagesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Conversation: ${data.conversationId}`);
      console.log(`  Sender: ${data.senderId} (${data.senderName})`);
      console.log(`  Content: ${data.content}`);
      console.log(`  Timestamp: ${data.timestamp?.toDate?.() || 'Invalid'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

debugConversations();
