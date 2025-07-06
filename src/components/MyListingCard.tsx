
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePenLine, Trash2, Loader2, Star, MapPin } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CATEGORIES } from '@/lib/constants';

interface MyListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    imageHint: string;
    location: string;
    postedDate: string;
    rating: number;
    ratingCount: number;
    category: string;
  };
  onDelete: (listingId: string) => Promise<void>;
  isDeleting: boolean;
}

export function MyListingCard({ listing, onDelete, isDeleting }: MyListingCardProps) {
  const router = useRouter();
  
  const handleEdit = () => {
    const categoryInfo = CATEGORIES.find(c => c.name === listing.category);
    if (categoryInfo) {
      router.push(`${categoryInfo.href}?id=${listing.id}`);
    } else {
      console.error(`Could not find category info for: ${listing.category}`);
    }
  };

  const handleDelete = () => {
    onDelete(listing.id);
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl rounded-2xl flex flex-col border">
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
      </div>
      <div className="p-4 space-y-3 flex-grow bg-card">
        <h3 className="font-bold text-xl truncate">{listing.title}</h3>
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold text-primary">${Number(listing.price).toFixed(2)}</p>
          <div className="flex items-center gap-1.5">
            <Star className="text-primary fill-primary h-5 w-5" />
            <span className="font-bold">{listing.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({listing.ratingCount})</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{listing.location}</span>
        </div>
      </div>
      <CardFooter className="p-4 border-t mt-auto bg-card">
        <div className="flex w-full justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
                <FilePenLine className="mr-2 h-4 w-4" />
                Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    listing from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Continue'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
