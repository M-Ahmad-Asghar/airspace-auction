"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Star, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/services/wishlistService';
import { toast } from '@/hooks/use-toast';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    imageHint: string;
    location: string;
    postedDate: string; // ISO string
    userName: string;
    userAvatarUrl: string;
    rating: number;
    ratingCount: number;
    // Additional fields for wishlist functionality
    manufacturer?: string;
    model?: string;
    year?: number;
    category?: string;
    imageUrls?: string[];
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if item is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user) {
        try {
          const inWishlist = await isInWishlist(user.uid, listing.id);
          setIsWishlisted(inWishlist);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      }
    };
    
    checkWishlistStatus();
  }, [user, listing.id]);
  
  const handleWishlistClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const success = await removeFromWishlist(user.uid, listing.id);
        if (success) {
          setIsWishlisted(false);
          toast({
            title: "Removed from Wishlist",
            description: `${listing.title} has been removed from your wishlist.`,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to remove item from wishlist.",
            variant: "destructive",
          });
        }
      } else {
        // Add to wishlist
        const success = await addToWishlist(user.uid, listing);
        if (success) {
          setIsWishlisted(true);
          toast({
            title: "Added to Wishlist",
            description: `${listing.title} has been added to your wishlist.`,
          });
        } else {
          toast({
            title: "Already in Wishlist",
            description: "This item is already in your wishlist.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error handling wishlist:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Copy listing URL to clipboard
    const listingUrl = `${window.location.origin}/listing/${listing.id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(listingUrl).then(() => {
        toast({
          title: "Link Copied",
          description: "Listing link has been copied to clipboard.",
        });
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = listingUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({
          title: "Link Copied",
          description: "Listing link has been copied to clipboard.",
        });
      });
    }
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

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl rounded-0 border group">
        <div className="relative">
          <div className="aspect-[4/3] relative">
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              className="object-cover bg-muted"
              data-ai-hint={listing.imageHint}
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-3 right-3 rounded-full h-9 w-9 transition-colors ${
              isWishlisted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-black/30 hover:bg-black/50 text-white'
            }`}
            onClick={handleWishlistClick}
            disabled={isLoading}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="p-4 space-y-3 bg-card">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-xl truncate">{listing.title}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground -mr-2 -mt-1 hover:text-primary" 
              onClick={handleShareClick}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-0 font-bold text-primary">
              ${Number(listing.price).toLocaleString('en-US', {
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
              })}
            </p>
            <div className="flex items-center gap-1.5">
              <Star className="text-primary fill-primary h-5 w-5" />
              <span className="font-bold">{listing.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({listing.ratingCount})</span>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={listing.userAvatarUrl} alt={listing.userName} data-ai-hint="man portrait"/>
              <AvatarFallback>{listing.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <p className="font-bold truncate">{listing.userName}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{listing.location}</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground self-end flex-shrink-0 whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
