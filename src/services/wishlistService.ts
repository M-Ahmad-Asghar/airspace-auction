'use server';

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
    searchTerm?: string; // Added searchTerm field
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
export async function addToWishlist(userId: string, listingData: any): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    // Check if item already exists in wishlist
    const existingQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', userId),
      where('listingId', '==', listingData.id)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log('Item already in wishlist');
      return false; // Already exists
    }

    // Add to wishlist
    const wishlistData = {
      userId,
      listingId: listingData.id,
      title: listingData.title || `${listingData.manufacturer || 'Unknown'} ${listingData.model || 'Item'}`,
      imageUrl: listingData.imageUrls?.[0] || listingData.imageUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop&crop=center',
      price: listingData.price || 0,
      location: listingData.location || 'Unknown',
      year: listingData.year || new Date().getFullYear(),
      manufacturer: listingData.manufacturer || 'Unknown',
      model: listingData.model || 'Unknown',
      category: listingData.category || 'Other',
      addedAt: new Date(),
    };

    await addDoc(collection(db, 'wishlist'), wishlistData);
    console.log('Item added to wishlist successfully');
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
}

// Remove item from wishlist
export async function removeFromWishlist(userId: string, listingId: string): Promise<boolean> {
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
    
    if (wishlistSnapshot.empty) {
      console.log('Item not found in wishlist');
      return false;
    }

    // Delete the wishlist item
    const wishlistDoc = wishlistSnapshot.docs[0];
    await deleteDoc(doc(db, 'wishlist', wishlistDoc.id));
    
    console.log('Item removed from wishlist successfully');
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
}

// Check if item is in wishlist
export async function isInWishlist(userId: string, listingId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
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
    console.error('Error checking wishlist status:', error);
    return false;
  }
}

// Get user's wishlist items - SIMPLIFIED QUERY (no orderBy to avoid index requirement)
export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    // Simplified query without orderBy to avoid index requirement
    const wishlistQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', userId)
    );
    
    const wishlistSnapshot = await getDocs(wishlistQuery);
    
    const items = wishlistSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate?.() || new Date(),
    })) as WishlistItem[];

    // Sort in JavaScript instead of Firebase
    items.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    
    console.log('Fetched wishlist items:', items.length);
    return items;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

// Save search
export async function saveSearch(userId: string, searchData: {
  title: string;
  filters: SavedSearch['filters'];
}): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured');
    return false;
  }

  try {
    const searchDoc = {
      userId,
      title: searchData.title,
      filters: searchData.filters,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'savedSearches'), searchDoc);
    console.log('Search saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving search:', error);
    return false;
  }
}

// Get user's saved searches - SIMPLIFIED QUERY (no orderBy to avoid index requirement)
export async function getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    // Simplified query without orderBy to avoid index requirement
    const searchesQuery = query(
      collection(db, 'savedSearches'),
      where('userId', '==', userId)
    );
    
    const searchesSnapshot = await getDocs(searchesQuery);
    
    const searches = searchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    })) as SavedSearch[];

    // Sort in JavaScript instead of Firebase
    searches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log('Fetched saved searches:', searches.length);
    return searches;
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
    console.log('Search deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting search:', error);
    return false;
  }
}
