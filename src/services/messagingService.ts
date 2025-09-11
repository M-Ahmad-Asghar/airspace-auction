'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  type DocumentData,
  Timestamp,
} from 'firebase/firestore';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  senderName: string;
  senderAvatar?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime: Date;
  unreadCount: number;
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
  adOwnerId: string;
  adOwnerName: string;
  adOwnerAvatar?: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
}

// Create or get conversation between two users
export async function getOrCreateConversation(
  senderId: string,
  receiverId: string,
  listingId?: string,
  listingData?: any
): Promise<string> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return '';
  }

  try {
    // Check if conversation already exists
    const existingQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', senderId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    for (const doc of existingSnapshot.docs) {
      const data = doc.data();
      if (data.participants.includes(receiverId)) {
        return doc.id;
      }
    }

    // Create new conversation
    const conversationData = {
      participants: [senderId, receiverId],
      adOwnerId: receiverId,
      customerId: senderId,
      listingId: listingId || null,
      listingTitle: listingData?.title || null,
      listingImage: listingData?.imageUrls?.[0] || null,
      lastMessageTime: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return '';
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
  senderName: string,
  senderAvatar?: string
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    // Add message to messages collection
    const messageData = {
      conversationId,
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
      senderName,
      senderAvatar: senderAvatar || null,
    };

    await addDoc(collection(db, 'messages'), messageData);

    // Update conversation with last message info
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        content,
        senderId,
        senderName,
        timestamp: new Date(),
      },
      lastMessageTime: new Date(),
      unreadCount: 1, // Increment unread count for receiver
    });

    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

// Get conversations for a user
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    const conversations: Conversation[] = [];
    
    for (const doc of conversationsSnapshot.docs) {
      const data = doc.data();
      
      // Get the other participant's info
      const otherParticipantId = data.participants.find((id: string) => id !== userId);
      
      conversations.push({
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage ? {
          id: '',
          conversationId: doc.id,
          senderId: data.lastMessage.senderId,
          receiverId: otherParticipantId,
          content: data.lastMessage.content,
          timestamp: data.lastMessage.timestamp?.toDate?.() || new Date(),
          read: true,
          senderName: data.lastMessage.senderName,
          senderAvatar: data.lastMessage.senderAvatar,
        } : undefined,
        lastMessageTime: data.lastMessageTime?.toDate?.() || new Date(),
        unreadCount: data.unreadCount || 0,
        listingId: data.listingId,
        listingTitle: data.listingTitle,
        listingImage: data.listingImage,
        adOwnerId: data.adOwnerId,
        adOwnerName: data.adOwnerName || 'Unknown',
        adOwnerAvatar: data.adOwnerAvatar,
        customerId: data.customerId,
        customerName: data.customerName || 'Unknown',
        customerAvatar: data.customerAvatar,
      });
    }

    // Sort by last message time
    conversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

// Get messages for a conversation
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const messages: Message[] = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      conversationId: doc.data().conversationId,
      senderId: doc.data().senderId,
      receiverId: doc.data().receiverId,
      content: doc.data().content,
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      read: doc.data().read,
      senderName: doc.data().senderName,
      senderAvatar: doc.data().senderAvatar,
    }));

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    return false;
  }

  try {
    // Update conversation unread count
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      unreadCount: 0,
    });

    // Mark all messages in conversation as read
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const updatePromises = messagesSnapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
    
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
}

// Get unread message count for a user
export async function getUnreadMessageCount(userId: string): Promise<number> {
  if (!isFirebaseConfigured || !db) {
    return 0;
  }

  try {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    let totalUnread = 0;
    conversationsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.adOwnerId === userId) {
        totalUnread += data.unreadCount || 0;
      }
    });
    
    return totalUnread;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

// Get user info for messaging
export async function getUserInfo(userId: string): Promise<{name: string, avatar?: string} | null> {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        name: data.displayName || data.name || 'Unknown User',
        avatar: data.photoURL || data.avatar,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}
