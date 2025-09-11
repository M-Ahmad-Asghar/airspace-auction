"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Heart,
  X,
  ArrowRight,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Star,
  Eye,
  Plus,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  getUserWishlist, 
  getUserSavedSearches, 
  deleteSavedSearch,
  type WishlistItem,
  type SavedSearch 
} from '@/services/wishlistService';
import { toast } from '@/hooks/use-toast';

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlistSearchTerm, setWatchlistSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WishlistItem[]>([]);

  const fetchData = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }
    
    setLoading(true);
    try {
      const [searches, wishlist] = await Promise.all([
        getUserSavedSearches(user.uid),
        getUserWishlist(user.uid)
      ]);
      
      setSavedSearches(searches);
      setWatchlistItems(wishlist);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load saved searches and watchlist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleProceedSearch = (search: SavedSearch) => {
    // Build URL with all saved search parameters
    const searchParams = new URLSearchParams();
    
    // Add all saved filters to the URL
    if (search.filters.category) searchParams.set('category', search.filters.category);
    if (search.filters.searchTerm) searchParams.set('searchTerm', search.filters.searchTerm);
    if (search.filters.type) searchParams.set('type', search.filters.type);
    if (search.filters.priceMin) searchParams.set('priceMin', search.filters.priceMin.toString());
    if (search.filters.priceMax) searchParams.set('priceMax', search.filters.priceMax.toString());
    if (search.filters.location) searchParams.set('location', search.filters.location);
    if (search.filters.yearMin) searchParams.set('yearMin', search.filters.yearMin.toString());
    if (search.filters.yearMax) searchParams.set('yearMax', search.filters.yearMax.toString());
    if (search.filters.manufacturer) searchParams.set('manufacturer', search.filters.manufacturer);
    if (search.filters.model) searchParams.set('model', search.filters.model);
    
    // Navigate to home page with all the saved search parameters
    const url = `/home?${searchParams.toString()}`;
    console.log('Proceeding to:', url);
    router.push(url);
  };

  const handleRemoveSearch = async (searchId: string) => {
    try {
      const success = await deleteSavedSearch(searchId);
      if (success) {
        setSavedSearches(prev => prev.filter(search => search.id !== searchId));
        toast({
          title: "Search Removed",
          description: "Saved search has been removed.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove saved search.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing search:', error);
      toast({
        title: "Error",
        description: "Failed to remove saved search.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveWatchlistItem = (itemId: string) => {
    setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your watchlist.",
    });
  };

  const filteredSearches = savedSearches.filter(search =>
    search.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWatchlist = watchlistItems.filter(item =>
    item.title.toLowerCase().includes(watchlistSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Search & Watchlist</h1>
          <Button onClick={() => router.push('/admin')} variant="ghost" size="sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Search & Watchlist</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} disabled={refreshing} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/admin')} variant="ghost" size="sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Saved Searches Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Saved Searches</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              See All
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search saved searches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSearches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No saved searches found</p>
                <p className="text-sm">Start by creating a search to save it for later</p>
              </div>
            ) : (
              filteredSearches.map((search) => (
                <div key={search.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop&crop=center"
                      alt={search.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {search.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Created {search.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {search.filters.searchTerm && (
                        <Badge variant="outline" className="text-xs">
                          "{search.filters.searchTerm}"
                        </Badge>
                      )}
                      {search.filters.category && (
                        <Badge variant="outline" className="text-xs">
                          {search.filters.category}
                        </Badge>
                      )}
                      {search.filters.type && (
                        <Badge variant="outline" className="text-xs">
                          {search.filters.type}
                        </Badge>
                      )}
                      {search.filters.priceMax && (
                        <Badge variant="outline" className="text-xs">
                          Under ${(search.filters.priceMax / 1000000).toFixed(1)}M
                        </Badge>
                      )}
                      {search.filters.priceMin && (
                        <Badge variant="outline" className="text-xs">
                          Over ${(search.filters.priceMin / 1000000).toFixed(1)}M
                        </Badge>
                      )}
                      {search.filters.location && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {search.filters.location}
                        </Badge>
                      )}
                      {search.filters.yearMin && (
                        <Badge variant="outline" className="text-xs">
                          {search.filters.yearMin}+ Year
                        </Badge>
                      )}
                      {search.filters.manufacturer && (
                        <Badge variant="outline" className="text-xs">
                          {search.filters.manufacturer}
                        </Badge>
                      )}
                      {search.filters.model && (
                        <Badge variant="outline" className="text-xs">
                          {search.filters.model}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleProceedSearch(search)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Proceed
                    </Button>
                    <Button
                      onClick={() => handleRemoveSearch(search.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Watchlists Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Wishlist</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              See All
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search watchlist items..."
              value={watchlistSearchTerm}
              onChange={(e) => setWatchlistSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredWatchlist.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No watchlist items found</p>
                <p className="text-sm">Add items to your watchlist to track them</p>
                <p className="text-xs mt-2 text-gray-400">
                  Try clicking the heart icon on any listing card
                </p>
              </div>
            ) : (
              filteredWatchlist.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">
                          ${(item.price / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{item.year}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{item.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Added {item.addedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => router.push(`/listing/${item.listingId}`)}
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleRemoveWatchlistItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
