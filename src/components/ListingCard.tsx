'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, Share2, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/services/wishlistService';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    imageHint: string;
    location: string;
    postedDate: string;
    userName: string;
    userAvatarUrl: string;
    rating: number;
    ratingCount: number;
    views: number;
    shares: number;
    category?: string;
    imageUrls?: string[];
    images?: string[];
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && listing.id) {
      checkWishlistStatus();
    }
  }, [user, listing.id]);

  const checkWishlistStatus = async () => {
    if (!user) return;
    
    try {
      const inWishlist = await isInWishlist(listing.id, user.uid);
      setIsInWishlistState(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save listings to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlistState) {
        await removeFromWishlist(listing.id, user.uid);
        setIsInWishlistState(false);
        toast({
          title: "Removed",
          description: "Listing removed from your wishlist.",
        });
      } else {
        await addToWishlist(listing.id, user.uid, {
          title: listing.title,
          price: listing.price,
          location: listing.location,
          image: listing.imageUrl,
          category: listing.category
        });
        setIsInWishlistState(true);
        toast({
          title: "Added",
          description: "Listing added to your wishlist.",
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };
  
  const formattedDate = listing.postedDate 
    ? (() => {
        try {
          const date = new Date(listing.postedDate);
          return isNaN(date.getTime()) ? 'N/A' : formatDistanceToNow(date, { addSuffix: true });
        } catch {
          return 'N/A';
        }
      })()
    : 'N/A';

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={listing.imageHint}
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Active
            </Badge>
          </div>

          {/* Views Count */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            <Eye className="h-3 w-3" />
            <span>{listing.views}</span>
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
              onClick={handleWishlistClick}
              disabled={isLoading}
            >
              <Heart 
                className={`h-4 w-4 ${isInWishlistState ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(listing.price)}
            </span>
            
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {listing.rating.toFixed(1)} ({listing.ratingCount})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                {listing.userName.charAt(0)}
              </div>
              <span className="truncate">{listing.userName}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="truncate">{listing.location}</span>
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{listing.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                <span>{listing.shares}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
