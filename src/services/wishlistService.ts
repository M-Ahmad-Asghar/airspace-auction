import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  getDoc,
  type DocumentData,
} from 'firebase/firestore';

// Webhook configuration for wishlist
const WISHLIST_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/HmFrZbc983RUZ5QEo6Zs/webhook-trigger/df3dc1ad-1d2b-4b34-b4b9-5f845f0c826f';

/**
 * Sends wishlist addition data to CRM webhook
 */
export interface WishlistItem {
  id: string;
  userId: string;
  listingId: string;
  title: string;
  imageUrl: string;
  price: number;
  location: string;
  year: number;
  manufacturer: string;
  model: string;
  category: string;
  addedAt: Date;
}

export interface SavedSearch {
  id: string;
  userId: string;
  title: string;
  filters: {
    searchTerm?: string;
    category?: string;
    type?: string;
    priceMin?: number;
    priceMax?: number;
    location?: string;
    yearMin?: number;
    yearMax?: number;
    manufacturer?: string;
    model?: string;
  };
  createdAt: Date;
}

// Add item to wishlist
export async function addToWishlist(listingId: string, userId: string, listingData: any): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    // Check if item already exists in wishlist
    const existingQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log('Item already in wishlist');
      return false; // Already exists
    }

    // Add to wishlist
    const wishlistData = {
      userId,
      listingId,
      title: listingData.title || 'Unknown Item',
      imageUrl: listingData.image || listingData.imageUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop&crop=center',
      price: listingData.price || 0,
      location: listingData.location || 'Unknown',
      year: listingData.year || new Date().getFullYear(),
      manufacturer: listingData.manufacturer || 'Unknown',
      model: listingData.model || 'Unknown',
      category: listingData.category || 'Other',
      addedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'wishlist'), wishlistData);
    
    // Send webhook after successful wishlist addition
    const wishlistItem: WishlistItem = {
      id: docRef.id,
      ...wishlistData,
    };
    await sendWishlistWebhook(wishlistItem, userId);
    console.log('=== CALLING WISHLIST WEBHOOK ===');
    console.log('Wishlist item:', wishlistItem);
    console.log('User ID:', userId);    
    console.log('Item added to wishlist successfully');
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
}

// Remove item from wishlist
export async function removeFromWishlist(listingId: string, userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    // Find the wishlist item to delete
    const wishlistQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );
    
    const wishlistSnapshot = await getDocs(wishlistQuery);
    
    if (wishlistSnapshot.empty) {
      console.log('Item not found in wishlist');
      return false;
    }

    // Delete the first matching item
    const docToDelete = wishlistSnapshot.docs[0];
    await deleteDoc(doc(db, 'wishlist', docToDelete.id));
    
    console.log('Item removed from wishlist successfully');
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
}

// Check if item is in wishlist
export async function isInWishlist(listingId: string, userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    const wishlistQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );
    
    const wishlistSnapshot = await getDocs(wishlistQuery);
    return !wishlistSnapshot.empty;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

// Get user's wishlist
export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return [];
  }

  try {
    const wishlistQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', userId)
    );
    
    const wishlistSnapshot = await getDocs(wishlistQuery);
    const wishlistItems: WishlistItem[] = [];
    
    wishlistSnapshot.forEach((doc) => {
      const data = doc.data();
      wishlistItems.push({
        id: doc.id,
        userId: data.userId,
        listingId: data.listingId,
        title: data.title,
        imageUrl: data.imageUrl,
        price: data.price,
        location: data.location,
        year: data.year,
        manufacturer: data.manufacturer,
        model: data.model,
        category: data.category,
        addedAt: data.addedAt?.toDate() || new Date(),
      });
    });
    
    return wishlistItems;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

// Save search filters
export async function saveSearch(userId: string, title: string, filters: any): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    const searchData = {
      userId,
      title,
      filters,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'savedSearches'), searchData);
    console.log('Search saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving search:', error);
    return false;
  }
}

// Get user's saved searches
export async function getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return [];
  }

  try {
    const searchesQuery = query(
      collection(db, 'savedSearches'),
      where('userId', '==', userId)
    );
    
    const searchesSnapshot = await getDocs(searchesQuery);
    const savedSearches: SavedSearch[] = [];
    
    searchesSnapshot.forEach((doc) => {
      const data = doc.data();
      savedSearches.push({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        filters: data.filters,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    
    return savedSearches;
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return [];
  }
}

// Delete saved search
export async function deleteSavedSearch(searchId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    await deleteDoc(doc(db, 'savedSearches', searchId));
    console.log('Saved search deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return false;
  }
}

// Remove item from wishlist by wishlist item ID
export async function removeFromWishlistById(wishlistItemId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    await deleteDoc(doc(db, 'wishlist', wishlistItemId));
    console.log('Wishlist item removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing wishlist item:', error);
    return false;
  }
}
export async function sendWishlistWebhook(wishlistData: WishlistItem, userId: string): Promise<void> {
  console.log('=== WISHLIST WEBHOOK FUNCTION CALLED (CLIENT) ===');
  console.log('Wishlist data:', wishlistData);
  console.log('User ID:', userId);
  
  try {
    const webhookData = {
      event: 'wishlist_added',
      timestamp: new Date().toISOString(),
      wishlist: {
        id: wishlistData.id,
        listingId: wishlistData.listingId,
        title: wishlistData.title,
        imageUrl: wishlistData.imageUrl,
        price: wishlistData.price,
        location: wishlistData.location,
        year: wishlistData.year,
        manufacturer: wishlistData.manufacturer,
        model: wishlistData.model,
        category: wishlistData.category,
        addedAt: wishlistData.addedAt.toISOString(),
      },
      user: {
        userId: userId,
      },
      source: 'airspace-auction',
      platform: 'web'
    };

    console.log('=== WISHLIST WEBHOOK PAYLOAD ===');
    console.log('URL:', WISHLIST_WEBHOOK_URL);
    console.log('Data being sent:', JSON.stringify(webhookData, null, 2));

    const response = await fetch(WISHLIST_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    console.log('=== WISHLIST WEBHOOK RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (!response.ok) {
      throw new Error(`Wishlist webhook failed with status: ${response.status}`);
    }

    console.log('=== WISHLIST WEBHOOK SUCCESS (CLIENT) ===');
    console.log('Webhook sent successfully for listing:', wishlistData.listingId);
  } catch (error) {
    console.error('=== WISHLIST WEBHOOK ERROR (CLIENT) ===');
    console.error('Error details:', error);
    // Don't throw the error to avoid breaking the wishlist flow
    // Just log it for monitoring purposes
  }
}

