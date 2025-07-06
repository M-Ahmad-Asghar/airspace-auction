'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
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
 * @param user The Firebase Auth user object.
 */
export async function createUserProfile(userData: UserProfileData): Promise<void> {
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
  } catch (error) {
    console.error('Error creating or checking user profile:', error);
    // To avoid failing the entire sign-up process, we can just log the error.
    // For a production app, you might want more robust error handling or retry logic.
    throw new Error('Failed to create user profile in Firestore.');
  }
}
