
'use server';

import { db, storage, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface AircraftListingData {
  userId: string;
  category: string;
  type: string;
  images: File[];
  location: string;
  price: number;
  registration: string;
  year: number;
  manufacturer: string;
  model: string;
  description: string;
  totalAirframeTime: number;
  engineTimeMin?: number;
  engineTimeMax?: number;
  engineDetails: string;
  propellerType: string;
  propellerTimeMin?: number;
  propellerTimeMax?: number;
  propellerDetails: string;
  propellerSerials: string;
  avionics: string;
  additional?: string;
  exteriorDetails: string;
  interiorDetails: string;
  inspectionStatus: string;
  ifr: string;
  youtubeLink?: string;
}

export interface PartListingData {
  userId: string;
  category: string;
  title: string;
  description: string;
  images: File[];
  location: string;
  price: number;
  year?: number;
  manufacturer: string;
  hours?: number;
  upgrade: boolean;
}

export interface EventListingData {
  userId: string;
  category: string;
  title: string;
  description: string;
  images: File[];
  location: string;
  date: Date;
  price?: number;
  upgrade: boolean;
}

export interface RealEstateListingData {
  userId: string;
  category: string;
  title: string;
  images: File[];
  location: string;
  price: number;
  description: string;
  beds: number;
  baths: number;
  hangerIncluded: string;
  upgrade: boolean;
}


/**
 * Creates a new aircraft listing in Firestore and uploads images to Storage.
 * @param formData The validated form data.
 * @param userId The UID of the user creating the listing.
 * @returns The ID of the newly created listing document.
 */
export async function createAircraftListing(formData: AircraftListingData, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db || !storage) {
    throw new Error('Firebase is not configured.');
  }

  const { images, ...listingData } = formData;
  
  // 1. Upload images to Firebase Storage
  const imageUrls = await Promise.all(
    images.map(async (image) => {
      const imageRef = ref(storage, `listings/${userId}/${uuidv4()}-${image.name}`);
      await uploadBytes(imageRef, image);
      return getDownloadURL(imageRef);
    })
  );

  // 2. Create a new document in the 'listings' collection
  const listingCollectionRef = collection(db, 'listings');
  const newListingDoc = {
    ...listingData,
    userId,
    imageUrls,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(listingCollectionRef, newListingDoc);

  return docRef.id;
}


/**
 * Creates a new part listing in Firestore and uploads images to Storage.
 * @param formData The validated form data.
 * @param userId The UID of the user creating the listing.
 * @returns The ID of the newly created listing document.
 */
export async function createPartListing(formData: PartListingData, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db || !storage) {
    throw new Error('Firebase is not configured.');
  }

  const { images, ...listingData } = formData;

  const imageUrls = await Promise.all(
    images.map(async (image) => {
      const imageRef = ref(storage, `listings/${userId}/${uuidv4()}-${image.name}`);
      await uploadBytes(imageRef, image);
      return getDownloadURL(imageRef);
    })
  );

  const listingCollectionRef = collection(db, 'listings');
  const newListingDoc = {
    ...listingData,
    userId,
    imageUrls,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(listingCollectionRef, newListingDoc);

  return docRef.id;
}

/**
 * Creates a new event listing in Firestore and uploads images to Storage.
 * @param formData The validated form data.
 * @param userId The UID of the user creating the listing.
 * @returns The ID of the newly created listing document.
 */
export async function createEventListing(formData: EventListingData, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db || !storage) {
    throw new Error('Firebase is not configured.');
  }

  const { images, ...listingData } = formData;

  const imageUrls = await Promise.all(
    images.map(async (image) => {
      const imageRef = ref(storage, `listings/${userId}/${uuidv4()}-${image.name}`);
      await uploadBytes(imageRef, image);
      return getDownloadURL(imageRef);
    })
  );

  const listingCollectionRef = collection(db, 'listings');
  const newListingDoc = {
    ...listingData,
    userId,
    imageUrls,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(listingCollectionRef, newListingDoc);

  return docRef.id;
}

/**
 * Creates a new real estate listing in Firestore and uploads images to Storage.
 * @param formData The validated form data.
 * @param userId The UID of the user creating the listing.
 * @returns The ID of the newly created listing document.
 */
export async function createRealEstateListing(formData: RealEstateListingData, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db || !storage) {
    throw new Error('Firebase is not configured.');
  }

  const { images, ...listingData } = formData;

  const imageUrls = await Promise.all(
    images.map(async (image) => {
      const imageRef = ref(storage, `listings/${userId}/${uuidv4()}-${image.name}`);
      await uploadBytes(imageRef, image);
      return getDownloadURL(imageRef);
    })
  );

  const listingCollectionRef = collection(db, 'listings');
  const newListingDoc = {
    ...listingData,
    userId,
    imageUrls,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(listingCollectionRef, newListingDoc);

  return docRef.id;
}


/**
 * Fetches the most recent listings from Firestore.
 * @param count The number of listings to fetch.
 * @returns An array of listing objects.
 */
export async function getRecentListings(count: number = 10): Promise<DocumentData[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase is not configured, returning empty array.');
        return [];
    }

    try {
        const listingsCollectionRef = collection(db, 'listings');
        const q = query(listingsCollectionRef, orderBy('createdAt', 'desc'), limit(count));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching recent listings:", error);
        throw new Error("Failed to fetch listings from Firestore.");
    }
}
