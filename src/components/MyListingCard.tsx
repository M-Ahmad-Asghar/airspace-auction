"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Heart, 
  MapPin, 
  Camera, 
  Star,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface MyListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    location: string;
    description: string;
    imageCount: number;
    userName: string;
    userAvatarUrl: string;
    rating: number;
    ratingCount: number;
    createdAt: string;
    status: 'active' | 'pending' | 'sold';
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export function MyListingCard({ 
  listing, 
  onEdit, 
  onDelete, 
  onView 
}: MyListingCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl rounded-2xl border group">
      <div className="relative">
        <div className="aspect-[4/3] relative">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover bg-muted"
          />
        </div>
        <div className="absolute top-3 left-3">
          <Badge className={getStatusColor(listing.status)}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <Button variant="ghost" size="icon" className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showActions && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => onView?.(listing.id)}
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => onEdit?.(listing.id)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                  onClick={() => onDelete?.(listing.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-bold text-xl">{listing.title}</h3>
          <p className="text-xl font-bold text-foreground">${Number(listing.price).toLocaleString()}</p>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Camera className="h-4 w-4" />
            <span>{listing.imageCount} Images</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(listing.createdAt), 'MMM dd, yyyy')}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{listing.description}</p>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={listing.userAvatarUrl} alt={listing.userName} />
              <AvatarFallback>{listing.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{listing.userName}</p>
              <div className="flex items-center gap-1">
                <Star className="text-primary fill-primary h-3 w-3" />
                <span className="font-bold text-xs">{listing.rating.toFixed(1)}</span>
                <span className="text-muted-foreground text-xs">({listing.ratingCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
