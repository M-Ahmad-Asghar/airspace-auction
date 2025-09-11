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
    if (!db) {
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

    await addDoc(collection(db, 'ratings'), ratingData);

    // Update listing with new rating stats
    await updateListingRatingStats(listingId);

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
      return {
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
