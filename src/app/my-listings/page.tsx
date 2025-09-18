"use client";

import { useState, useEffect } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getListingsByUserId, deleteListing } from '@/services/listingService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { ListingListItem } from '@/components/ListingListItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { safeTimestampToDate } from '@/lib/utils';

function formatListingData(listing: DocumentData) {
  // Safely convert timestamp with null checks
  const createdAt = safeTimestampToDate(listing.createdAt);
  const postedDate = createdAt 
    ? formatDistanceToNow(createdAt).replace('about ', '') + ' ago' 
    : 'N/A';

  const formattedData = {
    imageUrl: listing.imageUrls?.[0] || `https://placehold.co/600x450.png`,
    imageHint: listing.title || 'listing',
    description: listing.description || '',
    imageCount: listing.imageUrls?.length || 0,
    userName: listing.userName || 'Ad Owner',
    userAvatarUrl: listing.userAvatarUrl || 'https://placehold.co/40x40.png',
    rating: listing.averageRating || 5.0,
    ratingCount: listing.ratingCount || 0,
    id: listing.id || '',
    category: listing.category || 'Unknown',
    price: listing.price || 0,
    images: listing.imageUrls || listing.images || [], // Support both imageUrls and images
    location: listing.location || '',
    createdAt: listing.createdAt || new Date().toISOString(),
    status: listing.status || 'active',
    // Aircraft specific fields
    year: listing.year,
    manufacturer: listing.manufacturer,
    model: listing.model,
    totalAirframeTime: listing.totalAirframeTime,
    engineTimeMin: listing.engineTimeMin,
    engineTimeMax: listing.engineTimeMax,
  };

  let title = '';

  if (listing.category === 'Aircraft') {
      title = listing.title || `${listing.year || ''} ${listing.manufacturer || ''} ${listing.model || ''}`.trim();
  if (!title) title = listing.description || 'Listing';
  } else if (listing.category === 'Events') {
      title = listing.title || listing.description || 'Event Listing';
  } else if (listing.category === 'Real Estate') {
      title = listing.title || listing.description || 'Real Estate Listing';
  } else if (listing.category === 'Places') {
      title = listing.title || listing.description || 'Place Listing';
  } else if (listing.category === 'Services') {
      title = listing.title || listing.description || 'Service Listing';
  } else {
    // Default for Parts and other categories
    title = listing.title || `${listing.manufacturer || ''} Part`.trim();
  if (!title) title = listing.description || 'Listing';
  }

  return {
    ...formattedData,
    title,
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
                    const plainData = JSON.parse(JSON.stringify(data));
                    const sortedData = [...plainData].sort((a, b) => {
                        const aSeconds = a.createdAt?.seconds || 0;
                        const bSeconds = b.createdAt?.seconds || 0;
                        // Handle invalid timestamps by treating them as 0 (oldest)
                        if (isNaN(aSeconds) || aSeconds < 0) return 1;
                        if (isNaN(bSeconds) || bSeconds < 0) return -1;
                        return bSeconds - aSeconds;
                    });
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
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">My Listings</h1>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                if (user) {
                                    setLoading(true);
                                    getListingsByUserId(user.uid)
                                        .then(data => {
                                            const plainData = JSON.parse(JSON.stringify(data));
                                            const sortedData = [...plainData].sort((a, b) => {
                                                const aSeconds = a.createdAt?.seconds || 0;
                                                const bSeconds = b.createdAt?.seconds || 0;
                                                if (isNaN(aSeconds) || aSeconds < 0) return 1;
                                                if (isNaN(bSeconds) || bSeconds < 0) return -1;
                                                return bSeconds - aSeconds;
                                            });
                                            const formattedData = sortedData.map(formatListingData);
                                            setListings(formattedData);
                                        })
                                        .catch(error => {
                                            console.error("Failed to fetch user listings", error);
                                            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your listings.' });
                                        })
                                        .finally(() => setLoading(false));
                                }
                            }}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                    {isLoading ? (
                        <div className="space-y-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border bg-card text-card-foreground shadow-sm p-4 space-y-4">
                                    <Skeleton className="aspect-[4/3] w-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="space-y-6">
                            {listings.map(listing => (
                                <ListingListItem 
                                    key={listing.id} 
                                    listing={listing} 
                                    onDelete={handleDelete}
                                    showDeleteButton={true}
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
