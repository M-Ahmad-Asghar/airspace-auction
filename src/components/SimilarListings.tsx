"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, MapPin, Eye } from 'lucide-react';
import { getSimilarListings } from '@/services/listingService';
import { ListingCard } from '@/components/ListingCard';
import Link from 'next/link';
import type { DocumentData } from 'firebase/firestore';

interface SimilarListingsProps {
  listingId: string;
  category: string;
}

export function SimilarListings({ listingId, category }: SimilarListingsProps) {
  const [similarListings, setSimilarListings] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimilarListings();
  }, [listingId, category]);

  const loadSimilarListings = async () => {
    setLoading(true);
    try {
      const listings = await getSimilarListings(listingId, category, 4);
      setSimilarListings(listings);
    } catch (error) {
      console.error('Error loading similar listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Similar Listings</span>
            <Button variant="ghost" size="sm" disabled>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarListings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Similar {category} Listings</span>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/home?category=${category}`}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {similarListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
