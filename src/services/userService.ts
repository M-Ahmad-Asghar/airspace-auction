'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, limit, updateDoc } from 'firebase/firestore';

// Consolidated UserProfileData interface
export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  experience?: string;
  specialties?: string;
  createdAt?: string;
  lastLogin?: string;
  listingsCount?: number;
  totalViews?: number;
  averageRating?: number;
}

// Webhook configuration
const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/HmFrZbc983RUZ5QEo6Zs/webhook-trigger/0d9a943a-b1f3-47a5-95ff-d88257654048';

/**
 * Sends user signup data to CRM webhook
 */
export async function sendSignupWebhook(userData: UserProfileData, signupMethod: 'email' | 'google'): Promise<void> {
  try {
    const webhookData = {
      event: 'user_signup',
      timestamp: new Date().toISOString(),
      user: {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        emailVerified: userData.emailVerified,
        phone: userData.phone || null,
        bio: userData.bio || null,
        location: userData.location || null,
        website: userData.website || null,
        company: userData.company || null,
        jobTitle: userData.jobTitle || null,
        experience: userData.experience || null,
        specialties: userData.specialties || null,
        createdAt: userData.createdAt,
      },
      signupMethod,
      source: 'airspace-auction',
      platform: 'web'
    };

    console.log('=== WEBHOOK PAYLOAD ===');
    console.log('URL:', WEBHOOK_URL);
    console.log('Data being sent:', JSON.stringify(webhookData, null, 2));

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    console.log('=== WEBHOOK RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    console.log('Signup webhook sent successfully for user:', userData.uid);
  } catch (error) {
    console.error('Error sending signup webhook:', error);
    // Don't throw the error to avoid breaking the signup flow
    // Just log it for monitoring purposes
  }
}

/**
 * Checks if a user exists in the Firestore 'users' collection by email.
 * @param email The email to check.
 * @returns A boolean indicating if the user exists.
 */
export async function checkUserExistsByEmail(email: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase is not configured. Cannot check user existence.');
    // To be safe, we prevent login/registration if DB is not configured.
    throw new Error('Database is not configured.');
  }
  
  try {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if user exists by email:', error);
    // Propagate the error to be handled by the UI.
    throw new Error('Failed to check user existence in Firestore.');
  }
}


/**
 * Creates a user profile document in Firestore if it doesn't already exist.
 * This function is idempotent.
 * @param userData The user profile data.
 * @param signupMethod The method used for signup (email or google).
 */
export async function createUserProfile(userData: UserProfileData, signupMethod: 'email' | 'google' = 'email'): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase is not configured. Skipping user profile creation.');
    return;
  }

  const userRef = doc(db, 'users', userData.uid);

  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      // User profile already exists, no need to do anything.
      return;
    }
    
    // User profile does not exist, create it.
    const profileToSave = {
      ...userData,
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profileToSave);
    console.log('User profile created for UID:', userData.uid);

    // Send webhook after successful profile creation
    const userDataWithTimestamp = {
      ...userData,
      createdAt: new Date().toISOString(),
    };
    await sendSignupWebhook(userDataWithTimestamp, signupMethod);
  } catch (error) {
    console.error('Error creating or checking user profile:', error);
    // To avoid failing the entire sign-up process, we can just log the error.
    // For a production app, you might want more robust error handling or retry logic.
    throw new Error('Failed to create user profile in Firestore.');
  }
}

/**
 * Updates user profile data in Firestore
 */
export async function updateProfile(userId: string, profileData: {
  displayName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  experience?: string;
  specialties?: string;
}): Promise<boolean> {
  try {
    if (!isFirebaseConfigured || !db) {
      console.error('Firebase not configured');
      return false;
    }

    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, updateData, { merge: true });
    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

/**
 * Gets user profile data from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    if (!isFirebaseConfigured || !db) {
      console.error('Firebase not configured');
      return null;
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // Get additional stats
      const listingsQuery = query(
        collection(db, 'listings'),
        where('userId', '==', userId)
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listings = listingsSnapshot.docs.map(doc => doc.data());
      
      const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);
      const averageRating = listings.reduce((sum, listing) => sum + (listing.averageRating || 0), 0) / listings.length || 0;

      return {
        uid: userId,
        email: userData.email || null,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        emailVerified: userData.emailVerified || false,
        phone: userData.phone || '',
        bio: userData.bio || '',
        location: userData.location || '',
        website: userData.website || '',
        company: userData.company || '',
        jobTitle: userData.jobTitle || '',
        experience: userData.experience || '',
        specialties: userData.specialties || '',
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
        lastLogin: userData.lastLogin?.toDate?.()?.toISOString() || userData.lastLogin,
        listingsCount: listings.length,
        totalViews,
        averageRating: isNaN(averageRating) ? 0 : averageRating,
      };
    } else {
      // Create user profile if it doesn't exist
      const newUserData: UserProfileData = {
        uid: userId,
        email: null,
        displayName: null,
        photoURL: null,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', userId), {
        ...newUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newUserData;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Updates user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    if (!isFirebaseConfigured || !db) return;

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}
