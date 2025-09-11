import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  attachment?: {
    type: 'image';
    url: string;
    filename: string;
  };
  isRead: boolean;
}

export interface Conversation {
  id: string;
  adOwnerId: string;
  adOwnerName: string;
  adOwnerAvatar?: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  listingId: string;
  listingTitle?: string;
  lastMessage?: Message;
  lastMessageTime: Date;
  unreadCount: number;
  isStarred?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  createdAt: Date;
}

export async function createConversation(
  adOwnerId: string,
  adOwnerName: string,
  adOwnerAvatar: string | undefined,
  customerId: string,
  customerName: string,
  customerAvatar: string | undefined,
  listingId: string,
  listingTitle: string
): Promise<string | null> {
  try {
    console.log('createConversation: Starting with params:', {
      adOwnerId,
      adOwnerName,
      adOwnerAvatar,
      customerId,
      customerName,
      customerAvatar,
      listingId,
      listingTitle
    });
    
    // Check if conversation already exists
    console.log('createConversation: Checking for existing conversation...');
    const existingQuery = query(
      collection(db, 'conversations'),
      where('adOwnerId', '==', adOwnerId),
      where('customerId', '==', customerId),
      where('listingId', '==', listingId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    console.log('createConversation: Existing conversations found:', existingSnapshot.size);
    
    if (!existingSnapshot.empty) {
      const existingId = existingSnapshot.docs[0].id;
      console.log('createConversation: Conversation already exists:', existingId);
      return existingId;
    }

    console.log('createConversation: Creating new conversation...');
    
    // Build conversation data object, only including fields that are not undefined
    const conversationData: any = {
      adOwnerId,
      adOwnerName,
      customerId,
      customerName,
      listingId,
      listingTitle,
      lastMessageTime: serverTimestamp(),
      unreadCount: 0,
      isStarred: false,
      isArchived: false,
      isDeleted: false,
      createdAt: serverTimestamp(),
    };

    // Only add avatar fields if they have values
    if (adOwnerAvatar) {
      conversationData.adOwnerAvatar = adOwnerAvatar;
    }
    
    if (customerAvatar) {
      conversationData.customerAvatar = customerAvatar;
    }

    console.log('createConversation: Data to save:', conversationData);
    console.log('createConversation: Adding to database...');
    
    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    console.log('createConversation: Conversation created with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('createConversation: Error creating conversation:', error);
    console.error('createConversation: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    console.log('Getting conversations for user:', userId);
    
    // Get conversations where user is ad owner
    const adOwnerQuery = query(
      collection(db, 'conversations'),
      where('adOwnerId', '==', userId)
    );
    
    // Get conversations where user is customer
    const customerQuery = query(
      collection(db, 'conversations'),
      where('customerId', '==', userId)
    );
    
    const [adOwnerSnapshot, customerSnapshot] = await Promise.all([
      getDocs(adOwnerQuery),
      getDocs(customerQuery)
    ]);
    
    console.log(`Found ${adOwnerSnapshot.size} ad owner conversations and ${customerSnapshot.size} customer conversations`);
    
    const conversations: Conversation[] = [];
    
    // Process ad owner conversations
    adOwnerSnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        adOwnerId: data.adOwnerId,
        adOwnerName: data.adOwnerName,
        adOwnerAvatar: data.adOwnerAvatar,
        customerId: data.customerId,
        customerName: data.customerName,
        customerAvatar: data.customerAvatar,
        listingId: data.listingId,
        listingTitle: data.listingTitle,
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
        } : undefined,
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        unreadCount: data.unreadCount || 0,
        isStarred: data.isStarred || false,
        isArchived: data.isArchived || false,
        isDeleted: data.isDeleted || false,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    
    // Process customer conversations
    customerSnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        adOwnerId: data.adOwnerId,
        adOwnerName: data.adOwnerName,
        adOwnerAvatar: data.adOwnerAvatar,
        customerId: data.customerId,
        customerName: data.customerName,
        customerAvatar: data.customerAvatar,
        listingId: data.listingId,
        listingTitle: data.listingTitle,
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
        } : undefined,
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        unreadCount: data.unreadCount || 0,
        isStarred: data.isStarred || false,
        isArchived: data.isArchived || false,
        isDeleted: data.isDeleted || false,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    
    // Sort by last message time (newest first)
    conversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    
    console.log(`Returning ${conversations.length} total conversations`);
    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );
    
    const snapshot = await getDocs(q);
    const messages: Message[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        attachment: data.attachment,
        isRead: data.isRead || false,
      });
    });
    
    // Sort by timestamp (oldest first)
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return messages;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return [];
  }
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  content: string,
  senderName: string,
  senderAvatar: string | undefined,
  attachment?: { type: 'image'; url: string; filename: string }
): Promise<boolean> {
  try {
    console.log('Sending message:', { conversationId, senderId, content, attachment });
    
    // Upload file to Firebase Storage if attachment exists
    let attachmentData = attachment;
    if (attachment && attachment.url.startsWith('blob:')) {
      // Convert blob URL to file and upload
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const file = new File([blob], attachment.filename, { type: blob.type });
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `messages/${conversationId}/${Date.now()}_${attachment.filename}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      attachmentData = {
        type: 'image',
        url: downloadURL,
        filename: attachment.filename,
      };
    }

    // Prepare message data - only include attachment if it exists
    const messageData: any = {
      conversationId,
      senderId,
      senderName,
      content,
      timestamp: serverTimestamp(),
      isRead: false,
    };

    // Only add avatar field if it has a value
    if (senderAvatar) {
      messageData.senderAvatar = senderAvatar;
    }

    // Only add attachment field if it exists
    if (attachmentData) {
      messageData.attachment = attachmentData;
    }

    console.log('Message data to save:', messageData);
    await addDoc(collection(db, 'messages'), messageData);

    // Update conversation with last message
    const conversationRef = doc(db, 'conversations', conversationId);
    const updateData: any = {
      lastMessage: {
        content,
        timestamp: serverTimestamp(),
        senderId,
        senderName,
      },
      lastMessageTime: serverTimestamp(),
      unreadCount: recipientId === senderId ? 0 : 1, // Don't increment if sender is recipient
    };

    // Only add attachment to lastMessage if it exists
    if (attachmentData) {
      updateData.lastMessage.attachment = attachmentData;
    }

    await updateDoc(conversationRef, updateData);

    console.log('Message sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

// Real-time listeners
export function listenToConversationMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        attachment: data.attachment,
        isRead: data.isRead || false,
      });
    });
    
    // Sort by timestamp (oldest first)
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    callback(messages);
  });
}

export function listenToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
) {
  console.log('Setting up real-time listener for user:', userId);
  
  // Use a simpler approach - listen to all conversations and filter client-side
  const q = query(collection(db, 'conversations'));
  
  return onSnapshot(q, (snapshot) => {
    console.log(`Real-time update: received ${snapshot.size} conversations`);
    
    const conversations: Conversation[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only include conversations where user is either ad owner or customer
      if (data.adOwnerId === userId || data.customerId === userId) {
        console.log(`Including conversation ${doc.id} for user ${userId}`);
        conversations.push({
          id: doc.id,
          adOwnerId: data.adOwnerId,
          adOwnerName: data.adOwnerName,
          adOwnerAvatar: data.adOwnerAvatar,
          customerId: data.customerId,
          customerName: data.customerName,
          customerAvatar: data.customerAvatar,
          listingId: data.listingId,
          listingTitle: data.listingTitle,
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
          } : undefined,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          unreadCount: data.unreadCount || 0,
          isStarred: data.isStarred || false,
          isArchived: data.isArchived || false,
          isDeleted: data.isDeleted || false,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
    });
    
    // Sort by last message time (newest first)
    conversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    
    console.log(`Calling callback with ${conversations.length} conversations`);
    callback(conversations);
  }, (error) => {
    console.error('Real-time listener error:', error);
  });
}

export function listenToUnreadCount(
  userId: string,
  callback: (count: number) => void
) {
  const q = query(collection(db, 'conversations'));
  
  return onSnapshot(q, (snapshot) => {
    let totalUnread = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only count conversations where user is either ad owner or customer
      if (data.adOwnerId === userId || data.customerId === userId) {
        totalUnread += data.unreadCount || 0;
      }
    });
    
    callback(totalUnread);
  });
}

export function getUserInfoFromAuth(user: any) {
  return {
    name: user.displayName || user.email?.split('@')[0] || 'Unknown User',
    avatar: user.photoURL || undefined,
  };
}

// Additional functions for conversation management
export async function toggleStarConversation(conversationId: string, currentStarred: boolean): Promise<boolean> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      isStarred: !currentStarred,
    });
    return true;
  } catch (error) {
    console.error('Error toggling star:', error);
    return false;
  }
}

export async function toggleArchiveConversation(conversationId: string, currentArchived: boolean): Promise<boolean> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      isArchived: !currentArchived,
    });
    return true;
  } catch (error) {
    console.error('Error toggling archive:', error);
    return false;
  }
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    console.log('Deleting conversation and all messages:', conversationId);
    
    // First, delete all messages in this conversation
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    console.log(`Found ${messagesSnapshot.size} messages to delete`);
    
    // Delete all messages
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('All messages deleted');
    
    // Then delete the conversation itself
    const conversationRef = doc(db, 'conversations', conversationId);
    await deleteDoc(conversationRef);
    console.log('Conversation deleted');
    
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

// Cleanup function to permanently remove deleted conversations
export async function cleanupDeletedConversations(): Promise<boolean> {
  try {
    console.log('Starting cleanup of deleted conversations...');
    
    // Find all conversations marked as deleted
    const deletedQuery = query(
      collection(db, 'conversations'),
      where('isDeleted', '==', true)
    );
    
    const deletedSnapshot = await getDocs(deletedQuery);
    console.log(`Found ${deletedSnapshot.size} deleted conversations to clean up`);
    
    for (const conversationDoc of deletedSnapshot.docs) {
      const conversationId = conversationDoc.id;
      console.log(`Cleaning up conversation: ${conversationId}`);
      
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
    return true;
  } catch (error) {
    console.error('Error during cleanup:', error);
    return false;
  }
}
