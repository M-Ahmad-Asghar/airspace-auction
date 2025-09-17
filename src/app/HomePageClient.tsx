"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { getListings, type SearchFilters } from '@/services/listingService';
import { saveSearch } from '@/services/wishlistService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { DocumentData } from 'firebase/firestore';
import { FilterSort } from '@/components/FilterSort';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, X, Bookmark, Loader2 } from 'lucide-react';
import { ListingListItem } from '@/components/ListingListItem';
import { SponsoredAdCard } from '@/components/SponsoredAdCard';

function formatListingData(listing: any) {
  const formattedData = {
    id: listing.id || '',
    price: listing.price || 0,
    imageUrl: listing.imageUrls?.[0] || `https://placehold.co/600x450.png`,
    location: listing.location || 'Unknown Location',
    postedDate: listing.createdAt || new Date().toISOString(),
    userName: listing.userName userName: listing.userName && listing.userName !== 'Current User' && listing.userName !== 'Ad Owner' ? listing.userName : null,userName: listing.userName && listing.userName !== 'Current User' && listing.userName !== 'Ad Owner' ? listing.userName : null, listing.userName !== 'Current User' userName: listing.userName && listing.userName !== 'Current User' && listing.userName !== 'Ad Owner' ? listing.userName : null,userName: listing.userName && listing.userName !== 'Current User' && listing.userName !== 'Ad Owner' ? listing.userName : null, listing.userName !== 'Ad Owner' ? listing.userName : null,
    userAvatarUrl: 'https://placehold.co/40x40.png', // Placeholder
    rating: 5.0, // Placeholder
    ratingCount: 145, // Placeholder
    description: listing.description || 'No description provided.',
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
    title = `${listing.year || 'Unknown'} ${listing.manufacturer || 'Unknown'} ${listing.model || 'Unknown'}`;
    imageHint = `${listing.manufacturer || 'Unknown'} ${listing.model || 'Unknown'}`;
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
    imageHint = 'service professional';
  } else if (listing.category === 'Parts') {
    title = listing.title || 'Parts Listing';
    imageHint = 'aircraft parts';
  } else {
    title = listing.title || 'Listing';
    imageHint = 'general item';
  }

  return {
    ...formattedData,
    title,
    imageHint,
  };
}

function getFilterTags(filters: SearchFilters) {
  const tags = [];
  
  if (filters.searchTerm) {
    tags.push({
      key: 'searchTerm',
      label: `"${filters.searchTerm}"`,
      href: '/home'
    });
  }
  
  if (filters.type) {
    tags.push({
      key: 'type',
      label: filters.type,
      href: `/home?category=${filters.category || ''}`
    });
  }
  
  if (filters.yearMin) {
    tags.push({
      key: 'yearMin',
      label: `${filters.yearMin}+ Year`,
      href: `/home?category=${filters.category || ''}&type=${filters.type || ''}`
    });
  }
  
  if (filters.yearMax) {
    tags.push({
      key: 'yearMax',
      label: `Up to ${filters.yearMax}`,
      href: `/home?category=${filters.category || ''}&type=${filters.type || ''}&yearMin=${filters.yearMin || ''}`
    });
  }
  
  if (filters.manufacturer) {
    tags.push({
      key: 'manufacturer',
      label: filters.manufacturer,
      href: `/home?category=${filters.category || ''}&type=${filters.type || ''}&yearMin=${filters.yearMin || ''}&yearMax=${filters.yearMax || ''}`
    });
  }
  
  if (filters.model) {
    tags.push({
      key: 'model',
      label: filters.model,
      href: `/home?category=${filters.category || ''}&type=${filters.type || ''}&yearMin=${filters.yearMin || ''}&yearMax=${filters.yearMax || ''}&manufacturer=${filters.manufacturer || ''}`
    });
  }
  
  return tags;
}

export function HomePageClient({ searchParams }: { searchParams: Promise<SearchFilters> }) {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSearch, setSavingSearch] = useState(false);
  const [resolvedSearchParams, setResolvedSearchParams] = useState<SearchFilters>({});

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const params = await searchParams;
        // Filter out debug info and other non-search params
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([key]) => !key.startsWith('_'))
        );
        setResolvedSearchParams(cleanParams);
      } catch (error) {
        console.error('Error resolving search params:', error);
        setResolvedSearchParams({});
      }
    };
    resolveParams();
  }, [searchParams]);

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

  useEffect(() => {
    let isMounted = true;
    
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await getListings(filters);
        
        if (isMounted) {
          setListings(data);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        if (isMounted) {
          setListings([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchListings();
    
    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(filters)]);

  // Client-side filtering for ranges Firestore doesn't support in a single query
  const filteredListings = listings.filter((listing: any) => {
    if (filters.airframeHrMin && (listing.totalAirframeTime || 0) < filters.airframeHrMin) return false;
    if (filters.airframeHrMax && (listing.totalAirframeTime || 0) > filters.airframeHrMax) return false;
    if (filters.engineHrMin && (listing.engineTimeMin || 0) < filters.engineHrMin) return false;
    if (filters.engineHrMax && (listing.engineTimeMax || 0) > filters.engineHrMax) return false;
    return true;
  });

  const formattedListings = filteredListings.map(formatListingData);
  
  // Check if there are any active filters (excluding empty strings and undefined)
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (value === undefined || value === '') return false;
    return true;
  });

  const handleSaveSearch = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save searches.",
        variant: "destructive",
      });
      return;
    }

    setSavingSearch(true);
    try {
      // Generate search title based on active filters
      let searchTitle = 'Saved Search';
      if (filters.searchTerm) {
        searchTitle = `"${filters.searchTerm}"`;
      } else if (filters.category) {
        searchTitle = `${filters.category}`;
        if (filters.type) searchTitle += ` - ${filters.type}`;
        if (filters.manufacturer) searchTitle += ` ${filters.manufacturer}`;
        if (filters.model) searchTitle += ` ${filters.model}`;
      }

      const success = await saveSearch(user.uid, {
        title: searchTitle,
        filters: {
          searchTerm: filters.searchTerm,
          category: filters.category,
          type: filters.type,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          location: filters.location,
          yearMin: filters.yearMin,
          yearMax: filters.yearMax,
          manufacturer: filters.manufacturer,
          model: filters.model,
        }
      });

      if (success) {
        toast({
          title: "Search Saved",
          description: `"${searchTitle}" has been saved to your searches.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save search. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving search:', error);
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingSearch(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  // Show filtered view only when there are actual active filters
  if (hasActiveFilters) {
    const filterTags = getFilterTags(filters);
    const clearLink = filters.category ? `/home?category=${filters.category}` : '/home';

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
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
                  <X className="h-3.5 w-3.5" />
                </Link>
              ))}
              <Link href={clearLink} className="text-sm text-primary hover:underline ml-2">Remove All</Link>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <FilterSort />
            <Button 
              variant="outline" 
              onClick={handleSaveSearch}
              disabled={savingSearch}
              className="flex items-center space-x-2"
            >
              {savingSearch ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              <span>{savingSearch ? 'Saving...' : 'Save This Search'}</span>
            </Button>
          </div>

          {formattedListings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                {formattedListings.map((listing: any) => <ListingListItem key={listing.id} listing={listing} />)}
              </div>
              <aside className="hidden lg:col-span-4 lg:block space-y-6">
                <SponsoredAdCard />
              </aside>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No listings found matching your criteria.</p>
              <Link href="/home" className="text-primary hover:underline">Clear filters</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal home page view (no active filters)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <FilterSort />
        </div>

        {formattedListings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {formattedListings.map((listing: any) => <ListingListItem key={listing.id} listing={listing} />)}
            </div>
            <aside className="hidden lg:col-span-4 lg:block space-y-6">
              <SponsoredAdCard />
            </aside>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No listings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
