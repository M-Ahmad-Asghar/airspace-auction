import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { getListingsWithRatings, type SearchFilters } from '@/services/listingService';
import type { DocumentData } from 'firebase/firestore';
import { FilterSort } from '@/components/FilterSort';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, X } from 'lucide-react';
import { ListingListItem } from '@/components/ListingListItem';
import { SponsoredAdCard } from '@/components/SponsoredAdCard';
import { safeTimestampToISO } from '@/lib/utils';
import ConditionalHeader from '@/components/ConditionalHeader';

function formatListingData(listing: DocumentData) {
  // Safely convert timestamp with null checks
  const postDateStr = safeTimestampToISO(listing.createdAt) || new Date().toISOString();

  const formattedData = {
    id: listing.id || '',
    price: listing.price || 0,
    imageUrl: listing.imageUrls?.[0] || `https://placehold.co/600x450.png`,
    location: listing.location || '',
    postedDate: postDateStr,
    userName: listing.userName && listing.userName !== 'Current User' && listing.userName !== 'Ad Owner' ? listing.userName : null,
    userAvatarUrl: listing.userAvatarUrl || 'https://placehold.co/40x40.png',
    rating: listing.averageRating,
    ratingCount: listing.ratingCount,
    views: listing.views || 0,
    shares: listing.shares || 0,
    description: listing.description || '',
    imageCount: listing.imageUrls?.length || 0,
    // Additional fields for wishlist functionality
    manufacturer: listing.manufacturer,
    model: listing.model,
    year: listing.year,
    category: listing.category,
    imageUrls: listing.imageUrls,
  };

  let title = '';
  let imageHint = '';

  if (listing.category === 'Aircraft') {
    // Generate a more meaningful title for aircraft
    const parts = [];
    if (listing.year && listing.year !== '') parts.push(listing.year);
    if (listing.manufacturer && listing.manufacturer !== '') parts.push(listing.manufacturer);
    if (listing.model && listing.model !== '') parts.push(listing.model);
    
    if (parts.length > 0) {
      title = parts.join(' ');
    } else {
      title = listing.title || listing.description || 'Aircraft Listing';
    }
    // Generate a more meaningful image hint for aircraft
    const hintParts = [];
    if (listing.manufacturer && listing.manufacturer !== '') hintParts.push(listing.manufacturer);
    if (listing.model && listing.model !== '') hintParts.push(listing.model);
    
    if (hintParts.length > 0) {
      imageHint = hintParts.join(' ');
    } else {
      imageHint = 'aircraft';
    }
  } else if (listing.category === 'Events') {
    title = listing.title || listing.description || 'Event Listing';
    imageHint = 'event concert';
  } else if (listing.category === 'Real Estate') {
    title = listing.title || listing.description || 'Real Estate Listing';
    imageHint = 'real estate house';
  } else if (listing.category === 'Places') {
    title = listing.title || listing.description || 'Place Listing';
    imageHint = 'travel destination';
  } else if (listing.category === 'Services') {
    title = listing.title || listing.description || 'Service Listing';
    imageHint = 'professional service';
  } else {
    // Default for Parts and others
    title = listing.title || listing.description || `${listing.manufacturer || ''} Part`.trim();
    if (!title) title = 'Listing';
    imageHint = `${listing.manufacturer || 'Unknown'} part`;
  }
  
  return {
    ...formattedData,
    title,
    imageHint,
  };
}

const getFilterTags = (filters: SearchFilters) => {
    const tags: { key: string, label: string, href: string }[] = [];
    
    const createHref = (keyToRemove: string | string[]) => {
        const newParams = new URLSearchParams();
        const keysToRemove = Array.isArray(keyToRemove) ? keyToRemove : [keyToRemove];
        for (const key in filters) {
            if (!keysToRemove.includes(key) && filters[key as keyof SearchFilters]) {
                newParams.set(key, String(filters[key as keyof SearchFilters]));
            }
        }
        return `/home?${newParams.toString()}`;
    };

    if (filters.searchTerm) tags.push({ key: 'searchTerm', label: `"${filters.searchTerm}"`, href: createHref('searchTerm') });
    if (filters.type) tags.push({ key: 'type', label: filters.type, href: createHref('type') });
    if (filters.yearMin || filters.yearMax) {
        tags.push({ key: 'year', label: `Year: ${filters.yearMin || '*'} - ${filters.yearMax || '*'}`, href: createHref(['yearMin', 'yearMax']) });
    }
    if (filters.manufacturer) tags.push({ key: 'manufacturer', label: filters.manufacturer, href: createHref('manufacturer') });
    if (filters.model) tags.push({ key: 'model', label: filters.model, href: createHref('model') });
    if (filters.airframeHrMin || filters.airframeHrMax) {
        tags.push({ key: 'airframeHr', label: `Airframe: ${filters.airframeHrMin || '*'} - ${filters.airframeHrMax || '*'} hrs`, href: createHref(['airframeHrMin', 'airframeHrMax']) });
    }
    if (filters.engineHrMin || filters.engineHrMax) {
        tags.push({ key: 'engineHr', label: `Engine: ${filters.engineHrMin || '*'} - ${filters.engineHrMax || '*'} hrs`, href: createHref(['engineHrMin', 'engineHrMax']) });
    }

    return tags;
}

async function Listings({ filters }: { filters: SearchFilters }) {
  const listingsData = await getListingsWithRatings(filters);
  const listings = JSON.parse(JSON.stringify(listingsData));
  
  // Client-side filtering for ranges Firestore doesn't support in a single query
  const filteredListings = listings.filter((listing: DocumentData) => {
    if (filters.airframeHrMin && (listing.totalAirframeTime || 0) < filters.airframeHrMin) return false;
    if (filters.airframeHrMax && (listing.totalAirframeTime || 0) > filters.airframeHrMax) return false;
    if (filters.engineHrMin && (listing.engineTimeMin || 0) < filters.engineHrMin) return false;
    if (filters.engineHrMax && (listing.engineTimeMax || 0) > filters.engineHrMax) return false;
    return true;
  });

  const formattedListings = filteredListings.map(formatListingData);
  const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== '');

  if (hasActiveFilters) {
    const filterTags = getFilterTags(filters);
    const clearLink = filters.category ? `/home?category=${filters.category}` : '/home';
    
    return (
        <div>
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Link href="/home" className="hover:underline">Home</Link>
                {filters.category && <><ChevronRight className="h-4 w-4 mx-1" /> <Link href={`/home?category=${filters.category}`} className="hover:underline">{filters.category}</Link></>}
                {filters.type && <><ChevronRight className="h-4 w-4 mx-1" /> <Link href={`${clearLink}&type=${filters.type}`} className="hover:underline">{filters.type}</Link></>}
                {filters.model && <><ChevronRight className="h-4 w-4 mx-1" /> <span>{filters.model}</span></>}
            </div>

            {/* Filter Tags */}
            {filterTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    {filterTags.map((tag) => (
                        <Link href={tag.href} key={tag.key} className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm hover:bg-muted/80">
                            <span>{tag.label}</span>
                            <X className="h-3.5 w-3.5"/>
                        </Link>
                    ))}
                    <Link href={clearLink} className="text-sm text-primary hover:underline ml-2">Remove All</Link>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <FilterSort />
                <Button variant="outline">Save This Search</Button>
            </div>

            {formattedListings.length > 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        {formattedListings.map((listing: any, index: number) => <ListingListItem key={listing.id} listing={listing} index={index} />)}
                    </div>
                    <aside className="hidden lg:col-span-4 lg:block space-y-6">
                        <SponsoredAdCard
                            imageUrl="https://placehold.co/600x400.png"
                            imageHint="jet airplane"
                            title="Private Jet Sale"
                            description="Save big on top-tier aircraft with unbeatable prices. Limited stock available - grab your dream jet before it's gone!"
                        />
                         <SponsoredAdCard
                            imageUrl="https://placehold.co/600x400.png"
                            imageHint="jet sale"
                            title="Private Jet Sale"
                            description="Save big on top-tier aircraft with unbeatable prices. Limited stock available - grab your dream jet before it's gone!"
                        />
                    </aside>
                </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold">No listings found!</h2>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
                </div>
            )}
        </div>
    );
  }

  return (
      <>
        <div className="mb-6">
            <FilterSort />
        </div>

        {formattedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {formattedListings.map((listing: any) => (
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

export default async function HomePage({ searchParams }: { searchParams?: Promise<SearchFilters> }) {
  const resolvedSearchParams = await searchParams;
  
  const filters: SearchFilters = {
    category: resolvedSearchParams?.category,
    searchTerm: resolvedSearchParams?.searchTerm,
    type: resolvedSearchParams?.type,
    yearMin: resolvedSearchParams?.yearMin ? Number(resolvedSearchParams.yearMin) : undefined,
    yearMax: resolvedSearchParams?.yearMax ? Number(resolvedSearchParams.yearMax) : undefined,
    manufacturer: resolvedSearchParams?.manufacturer,
    model: resolvedSearchParams?.model,
    airframeHrMin: resolvedSearchParams?.airframeHrMin ? Number(resolvedSearchParams.airframeHrMin) : undefined,
    airframeHrMax: resolvedSearchParams?.airframeHrMax ? Number(resolvedSearchParams.airframeHrMax) : undefined,
    engineHrMin: resolvedSearchParams?.engineHrMin ? Number(resolvedSearchParams.engineHrMin) : undefined,
    engineHrMax: resolvedSearchParams?.engineHrMax ? Number(resolvedSearchParams.engineHrMax) : undefined,
  };

  return (
      <div className="flex flex-col min-h-screen">
        <ConditionalHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
            <Suspense fallback={<div className="text-center p-12">Loading listings...</div>}>
                <Listings filters={filters} />
            </Suspense>
        </main>
      </div>
  );
}
