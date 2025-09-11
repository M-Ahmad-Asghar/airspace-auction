const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, deleteDoc, doc } = require('firebase/firestore');

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

async function cleanupDeletedConversations() {
  try {
    console.log('Finding conversations marked as deleted...');
    
    // Find all conversations marked as deleted
    const deletedQuery = query(
      collection(db, 'conversations'),
      where('isDeleted', '==', true)
    );
    
    const deletedSnapshot = await getDocs(deletedQuery);
    console.log(`Found ${deletedSnapshot.size} deleted conversations`);
    
    for (const conversationDoc of deletedSnapshot.docs) {
      const conversationId = conversationDoc.id;
      console.log(`Processing conversation: ${conversationId}`);
      
      // Find all messages in this conversation
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      console.log(`Found ${messagesSnapshot.size} messages in conversation ${conversationId}`);
      
      // Delete all messages
      for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(doc(db, 'messages', messageDoc.id));
        console.log(`Deleted message: ${messageDoc.id}`);
      }
      
      // Delete the conversation
      await deleteDoc(doc(db, 'conversations', conversationId));
      console.log(`Deleted conversation: ${conversationId}`);
    }
    
    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupDeletedConversations();
