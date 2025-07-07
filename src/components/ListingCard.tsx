
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Star, MapPin } from 'lucide-react';

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
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  
  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    // Action logic here, e.g., adding to favorites
    console.log('Action button clicked');
  };

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl rounded-2xl border group">
        <div className="relative">
          <div className="aspect-[4/3] relative">
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              layout="fill"
              objectFit="cover"
              className="bg-muted"
              data-ai-hint={listing.imageHint}
            />
          </div>
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full h-9 w-9" onClick={handleActionClick}>
            <Heart className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 space-y-3 bg-card">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-xl">{listing.title}</h3>
            <Button variant="ghost" size="icon" className="text-muted-foreground -mr-2 -mt-1" onClick={handleActionClick}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold text-primary">${Number(listing.price).toFixed(2)}</p>
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
            <div className="flex-grow">
              <p className="font-bold">{listing.userName}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground self-end">{listing.postedDate}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
