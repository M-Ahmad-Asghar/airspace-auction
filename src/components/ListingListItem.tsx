"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Heart, MapPin, Camera, Star } from 'lucide-react';

interface ListingListItemProps {
  listing: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    imageHint: string;
    location: string;
    description: string;
    imageCount: number;
    userName: string;
    userAvatarUrl: string;
    rating: number;
    ratingCount: number;
  };
}

export function ListingListItem({ listing }: ListingListItemProps) {
  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl rounded-2xl border group flex flex-col md:flex-row">
        <div className="relative md:w-1/3">
          <div className="aspect-[4/3] relative">
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              className="object-cover bg-muted md:rounded-l-2xl md:rounded-r-none rounded-t-2xl"
              data-ai-hint={listing.imageHint}
            />
          </div>
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between bg-card">
            <div>
                <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-2xl">{listing.title}</h3>
                    <p className="text-2xl font-bold text-foreground">${Number(listing.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-4 mt-1">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Camera className="h-4 w-4" />
                        <span>{listing.imageCount} Images</span>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{listing.description}</p>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                    <AvatarImage src={listing.userAvatarUrl} alt={listing.userName} data-ai-hint="man portrait"/>
                    <AvatarFallback>{listing.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{listing.userName}</p>
                         <div className="flex items-center gap-1">
                            <Star className="text-primary fill-primary h-4 w-4" />
                            <span className="font-bold text-sm">{listing.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">({listing.ratingCount})</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <Bookmark className="h-6 w-6 text-muted-foreground" />
                </Button>
            </div>
        </div>
      </Card>
    </Link>
  );
}
