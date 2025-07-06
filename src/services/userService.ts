'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * Creates a user profile document in Firestore if it doesn't already exist.
 * This function is idempotent.
 * @param user The Firebase Auth user object.
 */
export async function createUserProfile(user: User): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase is not configured. Skipping user profile creation.');
    return;
  }

  const userRef = doc(db, 'users', user.uid);

  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      // User profile already exists, no need to do anything.
      return;
    }
    
    // User profile does not exist, create it.
    const userData = {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
    };

    await setDoc(userRef, userData);
    console.log('User profile created for UID:', user.uid);
  } catch (error) {
    console.error('Error creating or checking user profile:', error);
    // To avoid failing the entire sign-up process, we can just log the error.
    // For a production app, you might want more robust error handling or retry logic.
    throw new Error('Failed to create user profile in Firestore.');
  }
}
