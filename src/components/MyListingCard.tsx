
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePenLine, Trash2, Loader2 } from 'lucide-react';
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
    description: string;
    imageUrl: string;
    imageHint: string;
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
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            layout="fill"
            objectFit="cover"
            className="bg-muted"
            data-ai-hint={listing.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 truncate">{listing.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {listing.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto bg-muted/50">
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
