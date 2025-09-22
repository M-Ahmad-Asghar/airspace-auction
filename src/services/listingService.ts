import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, DocumentData } from 'firebase/firestore';

// Webhook configuration for listings
const LISTING_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/HmFrZbc983RUZ5QEo6Zs/webhook-trigger/4016772b-9751-483b-885c-38be96af4363';

/**
 * Sends listing creation data to CRM webhook
 */
export async function sendListingWebhook(listingData: any, listingId: string, userId: string): Promise<void> {
  try {
    const webhookData = {
      event: 'listing_created',
      timestamp: new Date().toISOString(),
      listing: {
        id: listingId,
        title: listingData.title || null,
        description: listingData.description || null,
        price: listingData.price || null,
        category: listingData.category || null,
        location: listingData.location || null,
        manufacturer: listingData.manufacturer || null,
        model: listingData.model || null,
        year: listingData.year || null,
        imageUrls: listingData.imageUrls || [],
        imageCount: listingData.imageCount || 0,
        views: listingData.views || 0,
        shares: listingData.shares || 0,
        averageRating: listingData.averageRating || 0,
        ratingCount: listingData.ratingCount || 0,
        createdAt: listingData.createdAt,
        updatedAt: listingData.updatedAt,
      },
      user: {
        userId: userId,
        userName: listingData.userName || null,
        userEmail: listingData.userEmail || null,
      },
      source: 'airspace-auction',
      platform: 'web'
    };

    console.log('=== LISTING WEBHOOK PAYLOAD ===');
    console.log('URL:', LISTING_WEBHOOK_URL);
    console.log('Data being sent:', JSON.stringify(webhookData, null, 2));

    const response = await fetch(LISTING_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    console.log('=== LISTING WEBHOOK RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (!response.ok) {
      throw new Error(`Listing webhook failed with status: ${response.status}`);
    }

    console.log('Listing webhook sent successfully for listing:', listingId);
  } catch (error) {
    console.error('Error sending listing webhook:', error);
    // Don't throw the error to avoid breaking the listing creation flow
    // Just log it for monitoring purposes
  }
}

export interface SearchFilters {
  category?: string;
  searchTerm?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  yearMin?: number;
  yearMax?: number;
  manufacturer?: string;
  model?: string;
  airframeHrMin?: number;
  airframeHrMax?: number;
  engineHrMin?: number;
  engineHrMax?: number;
}

// Helper function to convert Firebase Timestamps to plain objects
function serializeFirebaseData(data: DocumentData): any {
  const serialized = { ...data };
  
  // Convert Firebase Timestamps to ISO strings
  Object.keys(serialized).forEach(key => {
    const value = serialized[key];
    if (value && typeof value === 'object') {
      if (value.seconds !== undefined && value.nanoseconds !== undefined) {
        // This is a Firebase Timestamp
        serialized[key] = new Date(value.seconds * 1000).toISOString();
      } else if (value.toDate && typeof value.toDate === 'function') {
        // This is a Firebase Timestamp object
        serialized[key] = value.toDate().toISOString();
      }
    }
  });
  
  return serialized;
}

export async function getListings(filters: SearchFilters = {}): Promise<DocumentData[]> {
  try {
    let q = query(collection(db, 'listings'));

    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.searchTerm) {
      q = query(q, where('title', '>=', filters.searchTerm));
    }

    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }

    if (filters.manufacturer) {
      q = query(q, where('manufacturer', '==', filters.manufacturer));
    }

    if (filters.model) {
      q = query(q, where('model', '==', filters.model));
    }

    if (filters.location) {
      q = query(q, where('location', '==', filters.location));
    }

    // Get all documents first, then filter client-side for complex queries
    const querySnapshot = await getDocs(q);
    let listings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side filtering for ranges and complex queries
    if (filters.priceMin !== undefined) {
      listings = listings.filter(listing => (listing.price || 0) >= filters.priceMin!);
    }

    if (filters.priceMax !== undefined) {
      listings = listings.filter(listing => (listing.price || 0) <= filters.priceMax!);
    }

    if (filters.yearMin !== undefined) {
      listings = listings.filter(listing => (listing.year || 0) >= filters.yearMin!);
    }

    if (filters.yearMax !== undefined) {
      listings = listings.filter(listing => (listing.year || 0) <= filters.yearMax!);
    }

    if (filters.airframeHrMin !== undefined) {
      listings = listings.filter(listing => (listing.totalAirframeTime || 0) >= filters.airframeHrMin!);
    }

    if (filters.airframeHrMax !== undefined) {
      listings = listings.filter(listing => (listing.totalAirframeTime || 0) <= filters.airframeHrMax!);
    }

    if (filters.engineHrMin !== undefined) {
      listings = listings.filter(listing => (listing.engineTimeMin || 0) >= filters.engineHrMin!);
    }

    if (filters.engineHrMax !== undefined) {
      listings = listings.filter(listing => (listing.engineTimeMax || 0) <= filters.engineHrMax!);
    }

    // Client-side search filtering for better results
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      listings = listings.filter(listing => {
        const title = (listing.title || '').toLowerCase();
        const description = (listing.description || '').toLowerCase();
        const manufacturer = (listing.manufacturer || '').toLowerCase();
        const model = (listing.model || '').toLowerCase();
        const type = (listing.type || '').toLowerCase();
        
        return title.includes(searchTerm) || 
               description.includes(searchTerm) || 
               manufacturer.includes(searchTerm) || 
               model.includes(searchTerm) || 
               type.includes(searchTerm);
      });
    }

    // Sort by creation date (newest first)
    listings.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    // Serialize Firebase data before returning
    return listings.map(serializeFirebaseData);

  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export async function getListingById(id: string): Promise<DocumentData | null> {
  try {
    if (!db) {
      console.error('Firebase not initialized');
      return null;
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const listingRef = doc(db, 'listings', id);
    const listingSnap = await getDoc(listingRef);

    if (listingSnap.exists()) {
      const listingData = { id: listingSnap.id, ...listingSnap.data() };
      
      // Increment view count
      await incrementViewCount(id);
      
      return serializeFirebaseData(listingData);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

export async function getListingsByUserId(userId: string): Promise<DocumentData[]> {
  try {
    const listings = await getListings();
    return listings.filter(listing => listing.userId === userId);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return [];
  }
}

export async function deleteListing(listingId: string): Promise<boolean> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'listings', listingId));
    return true;
  } catch (error) {
    console.error('Error deleting listing:', error);
    return false;
  }
}

export async function incrementViewCount(listingId: string): Promise<void> {
  try {
    if (!db) return;

    const { doc, updateDoc, increment } = await import('firebase/firestore');
    const listingRef = doc(db, 'listings', listingId);
    
    await updateDoc(listingRef, {
      views: increment(1),
      lastViewed: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

export async function updateListingStats(listingId: string, stats: {
  views?: number;
  shares?: number;
  averageRating?: number;
  totalRatings?: number;
}): Promise<boolean> {
  try {
    if (!db) return false;

    const { doc, updateDoc } = await import('firebase/firestore');
    const listingRef = doc(db, 'listings', listingId);
    
    await updateDoc(listingRef, {
      ...stats,
      lastUpdated: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating listing stats:', error);
    return false;
  }
}

export async function getSimilarListings(listingId: string, category: string, limitCount: number = 4): Promise<DocumentData[]> {
  try {
    if (!db) {
      console.error('Firebase not initialized');
      return [];
    }

    const { query, where, limit, orderBy } = await import('firebase/firestore');
    const listingsQuery = query(
      collection(db, 'listings'),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(limitCount + 1) // +1 to exclude current listing
    );

    const querySnapshot = await getDocs(listingsQuery);
    const listings = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(listing => listing.id !== listingId) // Remove current listing
      .slice(0, limitCount); // Ensure we don't exceed limit

    return listings.map(serializeFirebaseData);
  } catch (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }
}

export async function createAircraftListing(data: any, userId: string, userName?: string, userEmail?: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    
    const listingData = {
      ...data,
      userId,
      userName: userName || 'Ad Owner',
      userEmail: userEmail || 'adowner@example.com',
      views: 0,
      shares: 0,
      averageRating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'listings'), listingData);
    
    // Send webhook after successful listing creation
    const listingDataWithTimestamp = {
      ...listingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await sendListingWebhook(listingDataWithTimestamp, docRef.id, userId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating aircraft listing:', error);
    throw error;
  }
}

export async function createRealEstateListing(data: any, userId: string, userName?: string, userEmail?: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    
    const listingData = {
      ...data,
      userId,
      userName: userName || 'Ad Owner',
      userEmail: userEmail || 'adowner@example.com',
      views: 0,
      shares: 0,
      averageRating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'listings'), listingData);
    
    // Send webhook after successful listing creation
    const listingDataWithTimestamp = {
      ...listingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await sendListingWebhook(listingDataWithTimestamp, docRef.id, userId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating real estate listing:', error);
    throw error;
  }
}

export async function createEventListing(data: any, userId: string, userName?: string, userEmail?: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    
    const listingData = {
      ...data,
      userId,
      userName: userName || 'Ad Owner',
      userEmail: userEmail || 'adowner@example.com',
      views: 0,
      shares: 0,
      averageRating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'listings'), listingData);
    
    // Send webhook after successful listing creation
    const listingDataWithTimestamp = {
      ...listingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await sendListingWebhook(listingDataWithTimestamp, docRef.id, userId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating event listing:', error);
    throw error;
  }
}

export async function createPartListing(data: any, userId: string, userName?: string, userEmail?: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    
    const listingData = {
      ...data,
      userId,
      userName: userName || 'Ad Owner',
      userEmail: userEmail || 'adowner@example.com',
      views: 0,
      shares: 0,
      averageRating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'listings'), listingData);
    
    // Send webhook after successful listing creation
    const listingDataWithTimestamp = {
      ...listingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await sendListingWebhook(listingDataWithTimestamp, docRef.id, userId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating part listing:', error);
    throw error;
  }
}

export async function createServiceListing(data: any, userId: string, userName?: string, userEmail?: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    
    const listingData = {
      ...data,
      userId,
      userName: userName || 'Ad Owner',
      userEmail: userEmail || 'adowner@example.com',
      views: 0,
      shares: 0,
      averageRating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'listings'), listingData);
    
    // Send webhook after successful listing creation
    const listingDataWithTimestamp = {
      ...listingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await sendListingWebhook(listingDataWithTimestamp, docRef.id, userId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating service listing:', error);
    throw error;
  }
}

export async function createPlaceListing(data: any, userId: string, userName?: string, userEmail?: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    
    const listingData = {
      ...data,
      userId,
      userName: userName || 'Ad Owner',
      userEmail: userEmail || 'adowner@example.com',
      views: 0,
      shares: 0,
      averageRating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'listings'), listingData);
    
    // Send webhook after successful listing creation
    const listingDataWithTimestamp = {
      ...listingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await sendListingWebhook(listingDataWithTimestamp, docRef.id, userId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating place listing:', error);
    throw error;
  }
}

export async function updateListing(listingId: string, data: any, userId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
}

// Get listing with real rating data
export async function getListingWithRatings(listingId: string): Promise<DocumentData | null> {
  try {
    if (!db) {
      console.error('Firebase not initialized');
      return null;
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const listingRef = doc(db, 'listings', listingId);
    const listingSnap = await getDoc(listingRef);

    if (listingSnap.exists()) {
      const listingData = { id: listingSnap.id, ...listingSnap.data() };
      
      // Fetch real rating data
      const { getListingRatingStats } = await import('@/services/ratingService');
      const ratingStats = await getListingRatingStats(listingId);
      
      // Update listing with real rating data
      listingData.averageRating = ratingStats.averageRating;
      listingData.ratingCount = ratingStats.totalRatings;
      
      return serializeFirebaseData(listingData);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching listing with ratings:', error);
    return null;
  }
}

// Get all listings with real rating data
export async function getListingsWithRatings(filters: SearchFilters = {}): Promise<DocumentData[]> {
  try {
    // Get basic listings first
    const listings = await getListings(filters);
    
    // Fetch rating data for each listing
    const { getListingRatingStats } = await import('@/services/ratingService');
    
    const listingsWithRatings = await Promise.all(
      listings.map(async (listing) => {
        try {
          const ratingStats = await getListingRatingStats(listing.id);
          return {
            ...listing,
            averageRating: ratingStats.averageRating,
            ratingCount: ratingStats.totalRatings,
          };
        } catch (error) {
          console.error(`Error fetching ratings for listing ${listing.id}:`, error);
          return {
            ...listing,
            averageRating: 0,
            ratingCount: 0,
          };
        }
      })
    );
    
    return listingsWithRatings;
  } catch (error) {
    console.error('Error fetching listings with ratings:', error);
    return [];
  }
}
