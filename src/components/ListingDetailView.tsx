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

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save listings to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    setWishlistLoading(true);
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
          image: images[0],
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
      setWishlistLoading(false);
    }
  };

  const handleImageClick = (src: string, alt: string) => {
    setImageModal({ isOpen: true, src, alt });
  };

  const nextImage = () => {
    setMainImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setMainImage((prev) => (prev - 1 + images.length) % images.length);
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
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
    if (listing.engineTimeMin && listing.engineTimeMax) {
      details.push({ label: 'Engine Time', value: `${listing.engineTimeMin}-${listing.engineTimeMax} hrs` });
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
                    src={images[mainImage]}
                    alt={listing.title}
                    fill
                    className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => handleImageClick(images[mainImage], listing.title)}
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
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {mainImage + 1} / {images.length}
                    </div>
                  )}

                  {/* Zoom Icon */}
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => handleImageClick(images[mainImage], listing.title)}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center bg-gray-100 text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="p-4 border-t">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(index)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === mainImage ? 'border-primary' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatPrice(listing.price || 0)}{listing.priceExtension ? ` ${listing.priceExtension}` : ""}
                </div>
                <div className="text-sm text-muted-foreground">
                  {listing.category} • {listing.year || 'Year not specified'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <MessageButton 
                  listingId={listing.id}
                  adOwnerId={listing.userId}
                  listingData={listing}
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isInWishlistState ? 'fill-red-500 text-red-500' : ''}`} />
                    {isInWishlistState ? 'Saved' : 'Save'}
                  </Button>
                  
                  <ShareButton listing={listing} />
                </div>
              </div>

              {/* Listing Stats */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">{listing.views || 0}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{listing.shares || 0}</div>
                    <div className="text-xs text-muted-foreground">Shares</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={listing.userAvatar} alt={listing.userName} />
                  <AvatarFallback>{listing.userName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{listing.userName || 'Ad Owner'}</h3>
                  {listing.totalRatings > 0 ? (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{listing.averageRating?.toFixed(1) || '5.0'}</span>
                    <span>({listing.totalRatings || 0} reviews)</span>
                  </div>
                ) : null}                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {formatDate(listing.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{listing.views || 0} views</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  {listing.status || 'Active'}
                </Badge>
              </div>

              <Separator className="my-4" />

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description || 'No description provided.'}
                </p>
              </div>

              {/* Dynamic Details */}
              <div>
                <h3 className="font-semibold mb-4">Details</h3>
                {renderDetails()}
              </div>
            </CardContent>
          </Card>

          {/* Ratings & Reviews */}
          <RatingComponent 
            listingId={listing.id}
            listingTitle={listing.title}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg">
                <MessageSquare className="h-4 !size-4 w-4 mr-2" />
                Contact Seller
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Safety Tips</CardTitle>
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

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
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
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => {
                const link = document.createElement('a');
                link.href = imageModal.src;
                link.download = `${listing.title}_image.jpg`;
                link.click();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
