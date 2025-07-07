
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { getListings, type SearchFilters } from '@/services/listingService';
import type { DocumentData } from 'firebase/firestore';
import { FilterSort } from '@/components/FilterSort';
import { Suspense } from 'react';

function formatListingData(listing: DocumentData) {
  const formattedData = {
    id: listing.id,
    price: listing.price || 0,
    imageUrl: listing.imageUrls?.[0] || `https://placehold.co/600x450.png`,
    location: listing.location || 'Unknown Location',
    // Dates are now strings after serialization
    postedDate: listing.createdAt, 
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


async function Listings({ filters }: { filters: SearchFilters }) {
  const listingsData = await getListings(filters);
  const listings = JSON.parse(JSON.stringify(listingsData));
  
  // Client-side filtering for ranges Firestore doesn't support in a single query
  const filteredListings = listings.filter((listing: DocumentData) => {
    if (filters.airframeHrMin && listing.totalAirframeTime < filters.airframeHrMin) return false;
    if (filters.airframeHrMax && listing.totalAirframeTime > filters.airframeHrMax) return false;
    if (filters.engineHrMin && listing.engineTimeMin < filters.engineHrMin) return false;
    if (filters.engineHrMax && listing.engineTimeMax > filters.engineHrMax) return false;
    return true;
  });

  const formattedListings = filteredListings.map(formatListingData);
  
  const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== '');

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        {hasActiveFilters ? (
            <h1 className="text-3xl font-bold">
                {filters.searchTerm ? `Results for "${filters.searchTerm}"` : 'Filtered Results'}
            </h1>
        ) : (
            <h1 className="text-3xl font-bold">Recent Listings</h1>
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
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </>
  );
}


export default function HomePage({ searchParams }: { searchParams?: SearchFilters }) {
  const filters: SearchFilters = {
    category: searchParams?.category,
    searchTerm: searchParams?.searchTerm,
    type: searchParams?.type,
    yearMin: searchParams?.yearMin ? Number(searchParams.yearMin) : undefined,
    yearMax: searchParams?.yearMax ? Number(searchParams.yearMax) : undefined,
    manufacturer: searchParams?.manufacturer,
    model: searchParams?.model,
    airframeHrMin: searchParams?.airframeHrMin ? Number(searchParams.airframeHrMin) : undefined,
    airframeHrMax: searchParams?.airframeHrMax ? Number(searchParams.airframeHrMax) : undefined,
    engineHrMin: searchParams?.engineHrMin ? Number(searchParams.engineHrMin) : undefined,
    engineHrMax: searchParams?.engineHrMax ? Number(searchParams.engineHrMax) : undefined,
  };

  return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
            <FilterSort />
            <Suspense fallback={<div className="text-center p-12">Loading listings...</div>}>
                <Listings filters={filters} />
            </Suspense>
        </main>
      </div>
  );
}
