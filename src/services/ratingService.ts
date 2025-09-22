import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';

// Webhook configuration for ratings
const RATING_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/HmFrZbc983RUZ5QEo6Zs/webhook-trigger/c989e53a-a3c5-4842-a21d-e5f6e32374da';

/**
 * Sends rating data to CRM webhook
 */
export async function sendRatingWebhook(ratingData: Rating, listingData: any): Promise<void> {
  console.log('=== RATING WEBHOOK FUNCTION CALLED ===');
  console.log('Rating data:', ratingData);
  console.log('Listing data:', listingData);
  
  try {
    const webhookData = {
      event: 'rating_given',
      timestamp: new Date().toISOString(),
      rating: {
        id: ratingData.id,
        listingId: ratingData.listingId,
        rating: ratingData.rating,
        comment: ratingData.comment || null,
        createdAt: ratingData.createdAt,
        isVerified: ratingData.isVerified,
      },
      user: {
        userId: ratingData.userId,
        userName: ratingData.userName,
        userAvatar: ratingData.userAvatar || null,
      },
      listing: {
        title: listingData.title || null,
        price: listingData.price || null,
        category: listingData.category || null,
        location: listingData.location || null,
        manufacturer: listingData.manufacturer || null,
        model: listingData.model || null,
        year: listingData.year || null,
      },
      source: 'airspace-auction',
      platform: 'web'
    };

    console.log('=== RATING WEBHOOK PAYLOAD ===');
    console.log('URL:', RATING_WEBHOOK_URL);
    console.log('Data being sent:', JSON.stringify(webhookData, null, 2));

    const response = await fetch(RATING_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    console.log('=== RATING WEBHOOK RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (!response.ok) {
      throw new Error(`Rating webhook failed with status: ${response.status}`);
    }

    console.log('=== RATING WEBHOOK SUCCESS ===');
    console.log('Rating webhook sent successfully for rating:', ratingData.id);
  } catch (error) {
    console.error('=== RATING WEBHOOK ERROR ===');
    console.error('Error details:', error);
    // Don't throw the error to avoid breaking the rating flow
    // Just log it for monitoring purposes
  }
}

export interface Rating {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: any;
  isVerified: boolean;
}

export interface ListingRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Add a rating for a listing
export async function addRating(
  listingId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  rating: number,
  comment?: string
): Promise<boolean> {
  try {
  console.log('=== ADDING RATING ===');
  console.log('Listing ID:', listingId);
  console.log('User ID:', userId);
  console.log('Rating:', rating);    if (!db) {
      console.error('Firebase not initialized');
      return false;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user already rated this listing
    const existingRatingQuery = query(
      collection(db, 'ratings'),
      where('listingId', '==', listingId),
      where('userId', '==', userId)
    );
    const existingRatings = await getDocs(existingRatingQuery);

    if (!existingRatings.empty) {
      throw new Error('You have already rated this listing');
    }

    // Add the rating
    const ratingData = {
      listingId,
      userId,
      userName,
      userAvatar: userAvatar || null,
      rating,
      comment: comment || '',
      createdAt: serverTimestamp(),
      isVerified: false, // Can be verified later by admin
    };

    console.log('=== BEFORE ADDING TO DATABASE ===');    const docRef = await addDoc(collection(db, 'ratings'), ratingData);

    console.log('=== RATING ADDED TO DATABASE ===');
    console.log('Rating ID:', docRef.id);

    // Get listing data for webhook
    const listingDoc = await getDoc(doc(db, 'listings', listingId));
    const listingData = listingDoc.exists() ? listingDoc.data() : {};

    console.log('=== CALLING RATING WEBHOOK ===');
    console.log('Listing data for webhook:', listingData);

    // Send webhook after successful rating
    const ratingWithId: Rating = {
      id: docRef.id,
      ...ratingData,
      createdAt: new Date().toISOString(),
    };
    
    try {
      await sendRatingWebhook(ratingWithId, listingData);
      console.log('=== RATING WEBHOOK SENT SUCCESSFULLY ===');
    } catch (webhookError) {
      console.error('=== RATING WEBHOOK ERROR ===');
      console.error('Webhook error:', webhookError);
    }

    // Update listing with new rating stats
    console.log('=== AFTER ADDING TO DATABASE ===');    await updateListingRatingStats(listingId);

    return true;
  } catch (error) {
    console.error('Error adding rating:', error);
    return false;
  }
}

// Get ratings for a specific listing
export async function getListingRatings(listingId: string, limitCount: number = 10): Promise<Rating[]> {
  try {
    if (!db) {
      console.error('Firebase not initialized');
      return [];
    }

    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('listingId', '==', listingId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(ratingsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rating));
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

// Get rating statistics for a listing
export async function getListingRatingStats(listingId: string): Promise<ListingRatingStats> {
  try {
    if (!db) {
      console.error('Firebase not initialized');
    console.log('=== RATING FUNCTION COMPLETED ===');      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('listingId', '==', listingId)
    );

    const querySnapshot = await getDocs(ratingsQuery);
    const ratings = querySnapshot.docs.map(doc => doc.data().rating as number);

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings;

    const ratingDistribution = {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length,
    };

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution
    };
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
}

// Update listing document with rating stats
async function updateListingRatingStats(listingId: string): Promise<void> {
  try {
    if (!db) return;

    const stats = await getListingRatingStats(listingId);
    const listingRef = doc(db, 'listings', listingId);
    
    await updateDoc(listingRef, {
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      ratingStats: stats.ratingDistribution,
      lastRatingUpdate: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating listing rating stats:', error);
  }
}

// Check if user has rated a listing
export async function hasUserRated(listingId: string, userId: string): Promise<boolean> {
  try {
    if (!db) return false;

    const ratingQuery = query(
      collection(db, 'ratings'),
      where('listingId', '==', listingId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(ratingQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user rating:', error);
    return false;
  }
}

// Get user's rating for a listing
export async function getUserRating(listingId: string, userId: string): Promise<Rating | null> {
  try {
    if (!db) return null;

    const ratingQuery = query(
      collection(db, 'ratings'),
      where('listingId', '==', listingId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(ratingQuery);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Rating;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
}
