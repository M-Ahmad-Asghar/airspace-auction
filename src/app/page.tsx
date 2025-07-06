
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { getRecentListings } from '@/services/listingService';
import type { DocumentData } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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


export default async function HomePage({ searchParams }: { searchParams?: { category?: string } }) {
  const category = searchParams?.category;
  const listings = await getRecentListings({ category });
  const formattedListings = listings.map(formatListingData);

  return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">{category ? `${category} Listings` : 'Recent Listings'}</h1>
              {category && (
                <Button asChild variant="outline">
                  <Link href="/">Clear Filter</Link>
                </Button>
              )}
            </div>
            {formattedListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {formattedListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold">No listings found!</h2>
                    <p className="text-muted-foreground mt-2">There are no listings in this category. Try another one!</p>
                </div>
            )}
        </main>
      </div>
  );
}
