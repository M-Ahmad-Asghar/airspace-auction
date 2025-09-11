import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, DocumentData } from 'firebase/firestore';

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
    const listings = await getListings();
    const listing = listings.find(l => l.id === id);
    return listing || null;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}
