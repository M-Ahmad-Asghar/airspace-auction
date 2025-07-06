
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { getRecentListings } from '@/services/listingService';
import type { DocumentData } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

function formatListingData(listing: DocumentData) {
  const formattedData = {
    id: listing.id,
    price: listing.price || 0,
    imageUrl: listing.imageUrls?.[0] || `https://placehold.co/600x450.png`,
    location: listing.location || 'Unknown Location',
    postedDate: listing.createdAt ? formatDistanceToNow(listing.createdAt.toDate()).replace('about ', '') + ' ago' : 'N/A',
    // Placeholders for data not available in the listing document
    userName: 'Joseph Andrew', // Placeholder
    userAvatarUrl: 'https://placehold.co/40x40.png', // Placeholder
    rating: 5.0, // Placeholder
    ratingCount: 145, // Placeholder
  };

  let title = '';
  let imageHint = '';

  if (listing.category === 'Aircraft') {
    title = `${listing.year} ${listing.manufacturer} ${listing.model}`;
    imageHint = `${listing.manufacturer} ${listing.model}`;
  } else if (listing.category === 'Events') {
    title = listing.title || 'Event Listing';
    imageHint = 'event concert';
  } else if (listing.category === 'Real Estate') {
    title = listing.title || 'Real Estate Listing';
    imageHint = 'real estate house';
  } else if (listing.category === 'Places') {
    title = listing.title || 'Place Listing';
    imageHint = 'travel destination';
  } else if (listing.category === 'Services') {
    title = listing.title || 'Service Listing';
    imageHint = 'professional service';
  } else {
    // Default for Parts and others
    title = listing.title || `${listing.manufacturer} Part`;
    imageHint = `${listing.manufacturer} part`;
  }
  
  return {
    ...formattedData,
    title,
    imageHint,
  };
}


export default async function HomePage({ searchParams }: { searchParams?: { category?: string } }) {
  const category = searchParams?.category;
  const listings = await getRecentListings({ category });
  const formattedListings = listings.map(formatListingData);

  return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">{category ? `${category} Listings` : 'Recent Listings'}</h1>
              {category && (
                <Button asChild variant="outline">
                  <Link href="/">Clear Filter</Link>
                </Button>
              )}
            </div>
            {formattedListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
