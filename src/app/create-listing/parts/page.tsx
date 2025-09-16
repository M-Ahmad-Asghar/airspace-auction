
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ImageUploader } from '@/components/ImageUploader';
import { createPartListing, getListingById, updateListing } from '@/services/listingService';
import { CATEGORIES, AIRCRAFT_MANUFACTURERS } from '@/lib/constants';
import { Loader2, MapPin, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const partFormSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  images: z.any().refine(files => files?.length >= 1, 'Please upload at least one image.').refine(files => files?.length <= 4, 'You can upload a maximum of 4 images.'),
  location: z.string().min(3, 'Location is required.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  year: z.coerce.number().int().min(1900, 'Year must be after 1900.').max(new Date().getFullYear() + 1, `Year can't be in the future.`).optional(),
  manufacturer: z.string().min(2, 'Manufacturer is required.'),
  hours: z.coerce.number().positive('Must be a positive number.').optional(),
});

export default function CreatePartListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');
  const isEditMode = !!listingId;

  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof partFormSchema>>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      category: 'Parts',
      title: '',
      description: '',
      images: [],
      location: '',
      price: undefined,
      manufacturer: '',
    },
  });
  
  useEffect(() => {
    if (isEditMode && listingId) {
      setIsLoading(true);
      getListingById(listingId)
        .then(listing => {
          if (listing && user && listing.userId === user.uid) {
            form.reset(listing);
            if (listing.imageUrls) {
              setExistingImages(listing.imageUrls);
              form.setValue('images', listing.imageUrls);
            }
          } else {
             toast({ variant: 'destructive', title: 'Error', description: 'Listing not found or you do not have permission to edit it.' });
             router.push('/my-listings');
          }
        })
        .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch listing details.' }))
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, listingId, form, toast, router, user]);

  const handleFilesChange = (files: (File | string)[]) => {
    form.setValue('images', files);
    // Trigger validation only for the images field
    setTimeout(() => {
      form.trigger('images');
    }, 0);
  };
  const handleCategoryChange = (categoryName: string) => {
    // Don't redirect if we're in edit mode
    if (isEditMode) {
      form.setValue('category', categoryName);
      return;
    }

    // Find the corresponding route for the selected category
    const selectedCategory = CATEGORIES.find(cat => cat.name === categoryName);
    if (selectedCategory) {
      router.push(selectedCategory.href);
    }
  };

  async function onSubmit(values: z.infer<typeof partFormSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to create a listing.' });
      return;
    }
    setIsLoading(true);

    try {
      if (isEditMode && listingId) {
        await updateListing(listingId, values, user.uid);
        toast({ title: 'Success!', description: "Your listing has been updated." });
      } else {
        await createPartListing(values, user.uid);
        toast({ title: 'Listing Created!', description: "Your new part listing has been successfully created." });
      }
      router.push('/my-listings');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: isEditMode ? 'Update Failed' : 'Submission Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-10">
          <div className="w-full max-w-5xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Listing' : 'New Classified Listing'}</h1>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={handleCategoryChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-8 pt-8 border-t">
                     <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Propeller for Cessna 172" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea placeholder="Describe the part and its condition..." {...field} className="min-h-[150px]" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>


                <div className="pt-8 border-t">
                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <ImageUploader onFilesChange={handleFilesChange} maxFiles={4} existingImages={existingImages} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-8 border-t">
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl><div className="relative"><Input placeholder="City, State, Country" {...field} className="pr-10" /><MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/></div></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl><div className="relative"><Input type="number" placeholder="Enter amount" {...field} className="pr-10" /><Info className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/></div></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl><Input type="number" placeholder="Add here" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="manufacturer" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select manufacturer(s)" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AIRCRAFT_MANUFACTURERS.map(manufacturer => <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="hours" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours</FormLabel>
                      <FormControl><Input type="number" placeholder="Enter here" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? (<> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>) : isEditMode ? 'Update Listing' : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
