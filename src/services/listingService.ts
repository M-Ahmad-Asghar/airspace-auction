
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
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  type DocumentData,
  type Query,
  QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';


// Interfaces for listing creation forms
export interface AircraftListingData {
  userId: string;
  category: string;
  type: string;
  images: (File | string)[];
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
  images: (File | string)[];
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
  images: (File | string)[];
  location: string;
  date: Date;
  price?: number;
  upgrade: boolean;
}

export interface RealEstateListingData {
  userId: string;
  category: string;
  title: string;
  images: (File | string)[];
  location: string;
  price: number;
  description: string;
  beds: number;
  baths: number;
  hangerIncluded: string;
  upgrade: boolean;
}

export interface PlaceListingData {
  userId: string;
  category: string;
  title: string;
  images: (File | string)[];
  location: string;
  description: string;
  upgrade: boolean;
}

export interface ServiceListingData {
    userId: string;
    category: string;
    title: string;
    images: (File | string)[];
    location: string;
    price: number;
    description: string;
    upgrade: boolean;
}

// Interface for search filters
export interface SearchFilters {
  category?: string;
  searchTerm?: string;
  type?: string;
  yearMin?: number;
  yearMax?: number;
  manufacturer?: string;
  model?: string;
  airframeHrMin?: number;
  airframeHrMax?: number;
  engineHrMin?: number;
  engineHrMax?: number;
  count?: number;
}


async function uploadImages(images: File[], userId: string): Promise<string[]> {
    if (!storage) throw new Error('Firebase Storage is not configured.');
    const imageUrls = await Promise.all(
        images.map(async (image) => {
        const imageRef = ref(storage, `listings/${userId}/${uuidv4()}-${image.name}`);
        await uploadBytes(imageRef, image);
        return getDownloadURL(imageRef);
        })
    );
    return imageUrls;
}

export async function createAircraftListing(formData: Omit<AircraftListingData, 'userId'>, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.');
  
  const { images, ...listingData } = formData;
  const newImageFiles = images.filter(img => img instanceof File) as File[];
  const imageUrls = await uploadImages(newImageFiles, userId);

  const newListingDoc = { ...listingData, userId, imageUrls, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'listings'), newListingDoc);
  return docRef.id;
}

export async function createPartListing(formData: Omit<PartListingData, 'userId'>, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.');

  const { images, ...listingData } = formData;
  const newImageFiles = images.filter(img => img instanceof File) as File[];
  const imageUrls = await uploadImages(newImageFiles, userId);

  const newListingDoc = { ...listingData, userId, imageUrls, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'listings'), newListingDoc);
  return docRef.id;
}

export async function createEventListing(formData: Omit<EventListingData, 'userId'>, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.');
  
  const { images, ...listingData } = formData;
  const newImageFiles = images.filter(img => img instanceof File) as File[];
  const imageUrls = await uploadImages(newImageFiles, userId);

  const newListingDoc = { ...listingData, userId, imageUrls, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'listings'), newListingDoc);
  return docRef.id;
}

export async function createRealEstateListing(formData: Omit<RealEstateListingData, 'userId'>, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.');

  const { images, ...listingData } = formData;
  const newImageFiles = images.filter(img => img instanceof File) as File[];
  const imageUrls = await uploadImages(newImageFiles, userId);

  const newListingDoc = { ...listingData, userId, imageUrls, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'listings'), newListingDoc);
  return docRef.id;
}

export async function createPlaceListing(formData: Omit<PlaceListingData, 'userId'>, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.');

  const { images, ...listingData } = formData;
  const newImageFiles = images.filter(img => img instanceof File) as File[];
  const imageUrls = await uploadImages(newImageFiles, userId);

  const newListingDoc = { ...listingData, userId, imageUrls, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'listings'), newListingDoc);
  return docRef.id;
}

export async function createServiceListing(formData: Omit<ServiceListingData, 'userId'>, userId: string): Promise<string> {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.');

  const { images, ...listingData } = formData;
  const newImageFiles = images.filter(img => img instanceof File) as File[];
  const imageUrls = await uploadImages(newImageFiles, userId);

  const newListingDoc = { ...listingData, userId, imageUrls, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'listings'), newListingDoc);
  return docRef.id;
}


export async function getListings(filters: SearchFilters = {}): Promise<DocumentData[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn('Firebase is not configured, returning empty array.');
        return [];
    }

    const {
        category, searchTerm, type, yearMin, yearMax, manufacturer, model, count = 20
    } = filters;

    try {
        const listingsCollectionRef = collection(db, 'listings');
        const constraints: QueryConstraint[] = [];

        // --- Equality and text search filters ---
        if (category) constraints.push(where('category', '==', category));
        if (type) constraints.push(where('type', '==', type));
        if (manufacturer) constraints.push(where('manufacturer', '==', manufacturer));
        if (model) constraints.push(where('model', '==', model));
        if (searchTerm) {
             constraints.push(where('title', '>=', searchTerm));
             constraints.push(where('title', '<=', searchTerm + '\uf8ff'));
        }

        // --- Range filters (only one field can have a range filter in Firestore) ---
        // We prioritize 'year' for the backend query. Other ranges will be client-filtered.
        if (yearMin) constraints.push(where('year', '>=', yearMin));
        if (yearMax) constraints.push(where('year', '<=', yearMax));

        // --- Sorting and Limiting ---
        constraints.push(orderBy(yearMin || yearMax || searchTerm ? 'year' : 'createdAt', 'desc'));
        constraints.push(limit(count));

        const q = query(listingsCollectionRef, ...constraints);
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error fetching listings:", error);
        // Fallback for missing indexes - fetch recent and filter client-side (less efficient)
        try {
            console.log('Falling back to a less efficient query. Please create the recommended Firestore index.');
            const fallbackQuery = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(50));
            const querySnapshot = await getDocs(fallbackQuery);
            let listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Manual filtering
            if (category) listings = listings.filter(l => l.category === category);
            if (searchTerm) listings = listings.filter(l => l.title?.toLowerCase().includes(searchTerm.toLowerCase()));
            if (yearMin) listings = listings.filter(l => l.year >= yearMin);
            // ... add other filters here if needed for fallback

            return listings.slice(0, count);

        } catch (fallbackError) {
             console.error("Error with fallback query:", fallbackError);
             return [];
        }
    }
}


export async function getListingsByUserId(userId: string): Promise<DocumentData[]> {
    if (!isFirebaseConfigured || !db || !userId) return [];

    try {
        const q = query(collection(db, 'listings'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return JSON.parse(JSON.stringify(listings));
    } catch (error) {
        console.error("Error fetching user listings:", error);
        return [];
    }
}

export async function getListingById(listingId: string): Promise<DocumentData | null> {
    if (!isFirebaseConfigured || !db) return null;
    try {
        const docRef = doc(db, 'listings', listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const listing = { id: docSnap.id, ...data };
            // Convert Firestore Timestamps to JS Date objects before serializing
            return JSON.parse(JSON.stringify(listing, (key, value) => {
                if (value && value.seconds !== undefined) {
                    return new Date(value.seconds * 1000).toISOString();
                }
                return value;
            }));
        }
        return null;
    } catch (error) {
        console.error("Error fetching listing by ID:", error);
        return null;
    }
}

export async function deleteListing(listingId: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !storage) throw new Error('Firebase is not configured.');

    const docRef = doc(db, 'listings', listingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error('Listing not found.');
    
    // Delete images from storage
    const { imageUrls } = docSnap.data();
    if (imageUrls && Array.isArray(imageUrls)) {
        await Promise.all(
            imageUrls.map(url => {
                const imageRef = ref(storage, url);
                return deleteObject(imageRef).catch(err => console.error(`Failed to delete image: ${url}`, err));
            })
        );
    }

    // Delete Firestore document
    await deleteDoc(docRef);
}


export async function updateListing(listingId: string, formData: DocumentData, userId: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !storage) throw new Error('Firebase is not configured.');

    const { images, ...listingData } = formData;
    
    const docRef = doc(db, 'listings', listingId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Listing not found');

    const existingImageUrls = docSnap.data().imageUrls || [];
    const currentImageUrls = images.filter((img: any) => typeof img === 'string');
    const newImageFiles = images.filter((img: any) => img instanceof File);

    // Identify and delete removed images
    const deletedImageUrls = existingImageUrls.filter((url: string) => !currentImageUrls.includes(url));
    await Promise.all(
        deletedImageUrls.map((url: string) => {
            const imageRef = ref(storage, url);
            return deleteObject(imageRef).catch(err => console.error(`Failed to delete image: ${url}`, err));
        })
    );

    // Upload new images
    const newUploadedUrls = await uploadImages(newImageFiles, userId);

    // Combine old and new image URLs
    const finalImageUrls = [...currentImageUrls, ...newUploadedUrls];

    // Update firestore document
    await updateDoc(docRef, {
        ...listingData,
        imageUrls: finalImageUrls,
        updatedAt: serverTimestamp()
    });
}
