"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convertUrlsToLinks } from '@/lib/linkUtils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Share2, 
  Bookmark, 
  MapPin, 
  Calendar, 
  Clock, 
  Star,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { MessageButton } from '@/components/MessageButton';
import { RatingComponent } from '@/components/RatingComponent';
import { ShareComponent, ShareButton } from '@/components/ShareComponent';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/services/wishlistService';
import type { DocumentData } from 'firebase/firestore';

export function ListingDetailView({ listing }: { listing: DocumentData }) {
  console.log("listing", listing);
  
  const { user } = useAuth();
  const [mainImage, setMainImage] = useState(0);
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: '',
    alt: ''
  });

  const images = listing.images || listing.imageUrls || [];
  const hasImages = images.length > 0;

  const handleImageClick = (src: string, alt: string) => {
    setImageModal({ isOpen: true, src, alt });
  };

  const nextImage = () => {
    setMainImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setMainImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  const renderDetails = () => {
    const details = [];

    if (listing.year) {
      details.push({ label: 'Year', value: listing.year });
    }
    if (listing.manufacturer) {
      details.push({ label: 'Manufacturer', value: listing.manufacturer });
    }
    if (listing.model) {
      details.push({ label: 'Model', value: listing.model });
    }
    if (listing.totalAirframeTime) {
      details.push({ label: 'Total Airframe Time', value: `${listing.totalAirframeTime.toLocaleString()} hrs` });
    }
    // Handle multiple engines
    if (listing.engines && listing.engines.length > 0) {
      listing.engines.forEach((engine, index) => {
        if (engine.engineTime) {
          details.push({ label: `Engine ${index + 1} Time`, value: engine.engineTime });
        }
        if (engine.engineModel) {
          details.push({ label: `Engine ${index + 1} Model`, value: engine.engineModel });
        }
        if (engine.engineSerial) {
          details.push({ label: `Engine ${index + 1} Serial`, value: engine.engineSerial });
        }
        if (engine.engineDetails) {
          details.push({ label: `Engine ${index + 1} Details`, value: engine.engineDetails });
        }
      });
    } else if (listing.engineTime) {
      // Handle legacy single engine format
      details.push({ label: 'Engine Time', value: listing.engineTime });
    }
    
    // Additional aircraft details
    if (listing.type) {
      details.push({ label: 'Type', value: listing.type });
    }
    if (listing.registration) {
      details.push({ label: 'Registration', value: listing.registration });
    }
    if (listing.propellerType) {
      details.push({ label: 'Propeller Type', value: listing.propellerType });
    }
    if (listing.propellerDetails) {
      details.push({ label: 'Propeller Details', value: listing.propellerDetails });
    }
    if (listing.propellerSerials) {
      details.push({ label: 'Propeller Serial', value: listing.propellerSerials });
    }
    if (listing.avionics) {
      details.push({ label: 'Avionics', value: listing.avionics });
    }
    if (listing.exteriorDetails) {
      details.push({ label: 'Exterior Details', value: listing.exteriorDetails });
    }
    if (listing.interiorDetails) {
      details.push({ label: 'Interior Details', value: listing.interiorDetails });
    }
    if (listing.inspectionStatus) {
      details.push({ label: 'Inspection Status', value: listing.inspectionStatus });
    }
    if (listing.ifr) {
      details.push({ label: 'IFR', value: listing.ifr });
    }
    
    if (listing.location) {
      details.push({ label: 'Location', value: listing.location });
    }
    if (listing.category) {
      details.push({ label: 'Category', value: listing.category });
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">{detail.label}</span>
            <span className="font-medium">{detail.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
              {hasImages ? (
                <>
                  <Image 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    src={images[mainImage]}
                    alt={listing.title || 'Aircraft listing'}
                    fill
                    className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => handleImageClick(images[mainImage], listing.title || 'Aircraft listing')}
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {mainImage + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <span className="text-gray-500">No images available</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MessageButton 
                listingId={listing.id} 
                sellerId={listing.userId}
                sellerName={listing.userName}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Safety Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Always meet in a public place</li>
                <li>• Verify the seller's identity</li>
                <li>• Inspect the item thoroughly</li>
                <li>• Use secure payment methods</li>
                <li>• Trust your instincts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Listing Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formatDate(listing.createdAt)}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Eye className="h-4 w-4" />
                  <span>{listing.views || 0} views</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDetails()}
            </CardContent>
          </Card>

          {/* Ratings & Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Ratings & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RatingComponent listingId={listing.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setImageModal({ isOpen: false, src: '', alt: '' })}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={imageModal.src}
              alt={imageModal.alt}
              width={1200}
              height={800}
              className="rounded-lg object-contain max-h-[90vh] w-full"
              onClick={() => setImageModal({ isOpen: false, src: '', alt: '' })}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageModal.src;
                  link.download = imageModal.alt;
                  link.click();
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
