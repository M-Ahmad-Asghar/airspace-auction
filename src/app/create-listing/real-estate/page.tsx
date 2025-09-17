
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
import { createRealEstateListing, getListingById, updateListing } from '@/services/listingService';
import { CATEGORIES } from '@/lib/constants';
import { Loader2, MapPin, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { PriceExtensionInput } from '@/components/PriceExtensionInput';

const realEstateFormSchema = z.object({
  category: z.string().optional(),
  type: z.string().min(1, 'Type is required.'),
  title: z.string().optional(),
  images: z.any().refine(files => files?.length >= 1, 'Please upload at least one image.').refine(files => files?.length <= 4, 'You can upload a maximum of 4 images.'),
  location: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number.").optional(),
  priceExtension: z.string().optional(),  description: z.string().min(20, 'Description must be at least 20 characters.'),
  beds: z.coerce.number().int().positive('Number of beds is required.').optional(),
  baths: z.coerce.number().int().positive('Number of baths is required.').optional(),
  hangerIncluded: z.string().optional(),
});

export default function CreateRealEstateListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');
  const isEditMode = !!listingId;

  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof realEstateFormSchema>>({
    resolver: zodResolver(realEstateFormSchema),
    defaultValues: {
      category: 'Real Estate',
      title: '',
      type: '',
      images: [],
      location: '',
      price: undefined,
      priceExtension: "",      description: '',
      beds: undefined,
      baths: undefined,
      hangerIncluded: '',
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

  async function onSubmit(values: z.infer<typeof realEstateFormSchema>) {
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
        await createRealEstateListing(values, user.uid, user.displayName || user.email?.split("@")[0] || "Ad Owner", user.email);
        toast({ title: 'Listing Created!', description: "Your new real estate listing has been successfully created." });
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

                <div className="pt-8 border-t">
                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                         <FormLabel className="text-base font-semibold">Add Photos</FormLabel>
                        <FormControl>
                          <ImageUploader onFilesChange={handleFilesChange} maxFiles={4} existingImages={existingImages} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>                <div className="space-y-8 pt-8 border-t">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Beautiful Home with Private Hangar" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl><Input placeholder="e.g., Aircraft, Engine, Propeller" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
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
                    <FormField control={form.control} name="priceExtension" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price Extension</FormLabel>
                        <FormControl>
                            <PriceExtensionInput
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select or add price extension..."
                              userId={user?.uid || ""}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />                     <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Textarea placeholder="Enter here" {...field} className="min-h-[150px] pr-10" />
                                    <Info className="absolute right-3 top-4 h-5 w-5 text-gray-400"/>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField control={form.control} name="beds" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Beds</FormLabel>
                            <FormControl><Input type="number" placeholder="Add here" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="baths" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Baths</FormLabel>
                            <FormControl><Input type="number" placeholder="Add here" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="hangerIncluded" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Hanger Included</FormLabel>
                        <FormControl><Input placeholder="Add here" {...field} /></FormControl>
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
