
"use client";

import { useState, useEffect } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getListingsByUserId, deleteListing } from '@/services/listingService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { MyListingCard } from '@/components/MyListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

function formatListingData(listing: DocumentData) {
    const commonData = {
        id: listing.id,
        description: listing.description,
        imageUrl: listing.imageUrls?.[0] || 'https://placehold.co/600x400.png',
        category: listing.category,
    };
    
    if (listing.category === 'Aircraft') {
      return {
          ...commonData,
          title: `${listing.year} ${listing.manufacturer} ${listing.model}`,
          imageHint: `${listing.manufacturer} ${listing.model}`
      };
    } else if (listing.category === 'Events') {
      return {
          ...commonData,
          title: listing.title || 'Event Listing',
          imageHint: 'event concert'
      };
    } else if (listing.category === 'Real Estate') {
      return {
          ...commonData,
          title: listing.title || 'Real Estate Listing',
          imageHint: 'real estate house'
      };
    } else if (listing.category === 'Places') {
      return {
          ...commonData,
          title: listing.title || 'Place Listing',
          imageHint: 'travel destination'
      };
    } else if (listing.category === 'Services') {
      return {
          ...commonData,
          title: listing.title || 'Service Listing',
          imageHint: 'professional service'
      };
    }
    
    // Default formatter for Parts and other categories
    return {
        ...commonData,
        title: listing.title || `${listing.manufacturer} Part`,
        imageHint: `${listing.manufacturer} part`
    };
}


export default function MyListingsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getListingsByUserId(user.uid)
                .then(data => {
                    const sortedData = [...data].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                    const formattedData = sortedData.map(formatListingData);
                    setListings(formattedData);
                })
                .catch(error => {
                    console.error("Failed to fetch user listings", error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your listings.' });
                })
                .finally(() => setLoading(false));
        }
    }, [user, toast]);

    const handleDelete = async (listingId: string) => {
        setDeletingId(listingId);
        try {
            await deleteListing(listingId);
            setListings(prev => prev.filter(l => l.id !== listingId));
            toast({ title: 'Success', description: 'Listing deleted successfully.' });
        } catch (error) {
            console.error("Failed to delete listing", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete listing.' });
        } finally {
            setDeletingId(null);
        }
    };

    const isLoading = authLoading || loading;

    return (
        <ProtectedRoute>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
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
                                <MyListingCard 
                                    key={listing.id} 
                                    listing={listing} 
                                    onDelete={handleDelete}
                                    isDeleting={deletingId === listing.id}
                                />
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
