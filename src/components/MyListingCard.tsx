'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Eye, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { deleteListing } from '@/services/listingService';
import { toast } from '@/hooks/use-toast';

interface MyListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    priceExtension?: string;    images: string[];
    location: string;
    postedDate: string;
    status?: string;
    rating?: number;
    ratingCount?: number;
    views?: number;
    shares?: number;
    category?: string;
    userName?: string;
    manufacturer?: string;
    model?: string;
    year?: number;
    totalAirframeTime?: number;
    engineTimeMin?: number;
    engineTimeMax?: number;
  };
  onDelete?: (listingId: string) => void;
}

// Diverse fallback images based on category
const getFallbackImage = (category: string, listingId: string) => {
  const aircraftImages = [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center'
  ];

  const partsImages = [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center'
  ];

  const realEstateImages = [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center'
  ];

  const servicesImages = [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center'
  ];

  const eventsImages = [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center'
  ];

  const placesImages = [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center'
  ];

  let imageArray = aircraftImages; // default
  
  switch (category?.toLowerCase()) {
    case 'aircraft':
      imageArray = aircraftImages;
      break;
    case 'parts':
      imageArray = partsImages;
      break;
    case 'real estate':
      imageArray = realEstateImages;
      break;
    case 'services':
      imageArray = servicesImages;
      break;
    case 'events':
      imageArray = eventsImages;
      break;
    case 'places':
      imageArray = placesImages;
      break;
    default:
      imageArray = aircraftImages;
  }

  // Use listing ID to consistently select the same image for the same listing
  const hash = listingId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const imageIndex = Math.abs(hash) % imageArray.length;
  return imageArray[imageIndex];
};

export function MyListingCard({ listing, onDelete }: MyListingCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price || price === null || price === undefined) {
      return 'Price on request';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getImageSrc = () => {
    if (imageError || !listing.images || listing.images.length === 0) {
      return getFallbackImage(listing.category || 'aircraft', listing.id);
    }
    return listing.images[0];
  };

  const handleDelete = async () => {
    if (!user) return;

    try {
      const success = await deleteListing(listing.id);
      if (success) {
        toast({
          title: "Success",
          description: "Listing deleted successfully.",
        });
        onDelete?.(listing.id);
      } else {
        throw new Error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = () => {
    router.push(`/listing/${listing.id}`);
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={getImageSrc()}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={getStatusColor(listing.status)}>
            {(listing.status || 'active').charAt(0).toUpperCase() + (listing.status || 'active').slice(1)}
          </Badge>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button variant="ghost" size="icon" className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
            onClick={handleView}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Dropdown Actions */}
        {showActions && (
          <div className="absolute top-12 right-3 bg-white rounded-lg shadow-lg border p-2 min-w-[120px] z-10">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleView}
            >
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => router.push(`/create-listing?edit=${listing.id}`)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}

        {/* Views Count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          <Eye className="h-3 w-3" />
          <span>{listing.views || 0}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {listing.rating?.toFixed(1) || '5.0'} ({listing.ratingCount || 0})
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-green-600">
              {formatPrice(listing.price)}{listing.priceExtension ? ` ${listing.priceExtension}` : ""}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(listing.postedDate)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span className="truncate">{listing.location}</span>
          </div>
          
          {listing.manufacturer && (
            <div className="text-sm text-gray-500">
              {listing.manufacturer} {listing.model && `- ${listing.model}`}
              {listing.year && ` (${listing.year})`}
            </div>
          )}
          
          {(listing.totalAirframeTime || listing.engineTimeMin || listing.engineTimeMax) && (
            <div className="text-xs text-gray-400">
              {listing.totalAirframeTime && `Airframe: ${listing.totalAirframeTime.toLocaleString()}hrs`}
              {(listing.engineTimeMin || listing.engineTimeMax) && 
                ` | Engine: ${listing.engineTimeMin || 0}-${listing.engineTimeMax || 0}hrs`
              }
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{listing.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{listing.shares || 0}</span>
            </div>
          </div>
          <span className="capitalize">{listing.category}</span>
        </div>
      </div>
    </Card>
  );
}
