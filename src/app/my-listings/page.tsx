
"use client";

import { useState, useEffect } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getListingsByUserId } from '@/services/listingService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { MyListingCard } from '@/components/MyListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function formatListingData(listing: DocumentData) {
    if (listing.category === 'Aircraft') {
      return {
          id: listing.id,
          title: `${listing.year} ${listing.manufacturer} ${listing.model}`,
          description: listing.description,
          imageUrl: listing.imageUrls?.[0] || 'https://placehold.co/600x400.png',
          imageHint: `${listing.manufacturer} ${listing.model}`
      };
    } else if (listing.category === 'Events') {
      return {
          id: listing.id,
          title: listing.title || 'Event Listing',
          description: listing.description,
          imageUrl: listing.imageUrls?.[0] || 'https://placehold.co/600x400.png',
          imageHint: 'event concert'
      };
    } else if (listing.category === 'Real Estate') {
      return {
          id: listing.id,
          title: listing.title || 'Real Estate Listing',
          description: listing.description,
          imageUrl: listing.imageUrls?.[0] || 'https://placehold.co/600x400.png',
          imageHint: 'real estate house'
      };
    } else if (listing.category === 'Places') {
      return {
          id: listing.id,
          title: listing.title || 'Place Listing',
          description: listing.description,
          imageUrl: listing.imageUrls?.[0] || 'https://placehold.co/600x400.png',
          imageHint: 'travel destination'
      };
    } else if (listing.category === 'Services') {
      return {
          id: listing.id,
          title: listing.title || 'Service Listing',
          description: listing.description,
          imageUrl: listing.imageUrls?.[0] || 'https://placehold.co/600x400.png',
          imageHint: 'professional service'
      };
    }
    
    // Default formatter for Parts and other categories
    return {
        id: listing.id,
        title: listing.title || `${listing.manufacturer} Part`,
        description: listing.description,
        imageUrl: listing.imageUrls?.[0] || 'https://placehold.co/600x400.png',
        imageHint: `${listing.manufacturer} part`
    };
}


export default function MyListingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [listings, setListings] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getListingsByUserId(user.uid)
                .then(data => {
                    // Sort data by creation time, newest first.
                    // The 'createdAt' field is a Firestore Timestamp object.
                    const sortedData = [...data].sort((a, b) => {
                        const timeA = a.createdAt?.seconds || 0;
                        const timeB = b.createdAt?.seconds || 0;
                        return timeB - timeA;
                    });
                    const formattedData = sortedData.map(formatListingData);
                    setListings(formattedData);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Failed to fetch user listings", error);
                    setLoading(false);
                });
        }
    }, [user]);

    const isLoading = authLoading || loading;

    return (
        <ProtectedRoute>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container py-8 flex flex-col">
                    <h1 className="text-3xl font-bold mb-6">My Listings</h1>
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-4">
                                    <Skeleton className="h-40 w-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {listings.map(listing => (
                                <MyListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                       <div className="flex-grow flex items-center justify-center">
                            <div className="text-center py-16 border-2 border-dashed rounded-lg w-full max-w-lg">
                                <h2 className="text-2xl font-semibold">You haven't posted any listings yet.</h2>
                                <p className="text-muted-foreground mt-2 mb-6">Why not create one now?</p>
                                <Button asChild>
                                    <Link href="/create-listing">Create New Listing</Link>
                                </Button>
                            </div>
                       </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
