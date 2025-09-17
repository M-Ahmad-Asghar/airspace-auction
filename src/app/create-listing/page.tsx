
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ImageUploader } from '@/components/ImageUploader';
import { createAircraftListing, getListingById, updateListing } from '@/services/listingService';
import { CATEGORIES, AIRCRAFT_TYPES, AIRCRAFT_MANUFACTURERS, AIRCRAFT_MODELS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { ManufacturerInput } from '@/components/ManufacturerInput';
import { ModelInput } from '@/components/ModelInput';
import { PriceExtensionInput } from '@/components/PriceExtensionInput';


const formSchema = z.object({
  category: z.string().optional(),
  type: z.string().min(1, 'Type is required.'),
  type: z.string().min(1, 'Type is required.'),
  images: z.any().refine(files => files?.length >= 1, 'Please upload at least one image.').refine(files => files?.length <= 4, 'You can upload a maximum of 4 images.'),
  location: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number.").optional(),
  priceExtension: z.string().optional(),  registration: z.string().optional(),
  year: z.coerce.number().int().min(1900, "Year must be after 1900.").max(new Date().getFullYear() + 1, `Year can't be in the future.`).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  totalAirframeTime: z.string().optional().transform((val) => {
    if (val === "" || val === undefined) return undefined;
    const num = Number(val);
    if (isNaN(num)) return undefined;
    return num;
}).refine((val) => val === undefined || val > 0, 'Must be a positive number.'),
  engineTime: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === "" || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
}).refine((val) => val === undefined || val > 0, 'Must be a positive number.'),
  
  engineDetails: z.string().optional(),
  propellerType: z.string().optional(),
  propellerTime: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === "" || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
}).refine((val) => val === undefined || val > 0, 'Must be a positive number.'),
  
  propellerDetails: z.string().optional(),
  propellerSerials: z.string().optional(),
  avionics: z.string().optional(),
  additional: z.string().optional(),
  exteriorDetails: z.string().optional(),
  interiorDetails: z.string().optional(),
  inspectionStatus: z.string().optional(),
  ifr: z.string().optional(),
  });

export default function CreateListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');
  const isEditMode = !!listingId;

  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
      const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'Aircraft',
      type: '',
      images: [],
      location: '',
      price: undefined,
      registration: '',
      year: undefined,
      manufacturer: '',
      model: '',
      description: '',
      totalAirframeTime: "",
      engineTime: "",
      propellerTime: "",
      engineDetails: '',
      propellerType: '',
      propellerDetails: '',
      propellerSerials: '',
      avionics: '',
      exteriorDetails: '',
      interiorDetails: '',
      inspectionStatus: '',
      ifr: '',
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


  
  const extractVideoId = (url: string): string | null => {
      if (!url) return null;
      const match = url.match(regex);
      return match ? match[1] : null;
  };

  
  

  const handleFilesChange = (files: (File | string)[]) => {
    form.setValue('images', files, { shouldValidate: true });
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
        await createAircraftListing(values, user.uid, user.displayName || user.email?.split('@')[0] || 'Ad Owner', user.email);
        toast({ title: 'Listing Created!', description: "Your new aircraft listing has been successfully created." });
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AIRCRAFT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
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
                         <FormLabel className="text-base font-semibold">Add Photos</FormLabel>
                        <FormControl>
                          <ImageUploader onFilesChange={handleFilesChange} maxFiles={4} existingImages={existingImages} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-8 border-t">
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl><Input placeholder="City, State, Country" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl><Input type="number" placeholder="Enter amount" {...field} /></FormControl>
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
                  )} />                  <FormField control={form.control} name="registration" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration</FormLabel>
                      <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
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
                      <FormControl>
                        <ManufacturerInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Search or add manufacturer..."
                          userId={user?.uid || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <ModelInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Search or add model..."
                          userId={user?.uid || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="pt-8 border-t">
                    <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the aircraft..." {...field} className="min-h-[150px]" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                
                <div className="space-y-8 pt-8 border-t">
                  <h3 className="text-xl font-semibold text-foreground">Aircraft Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    <FormField control={form.control} name="totalAirframeTime" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Total Airframe Time</FormLabel>
                        <FormControl><Input type="number" placeholder="Enter numeric hours (e.g., 3,100 hrs)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="engineTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engine Time</FormLabel>
                        <FormControl><Input type="number" placeholder="Enter engine hours" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="engineDetails" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engine Details</FormLabel>
                        <FormControl><Textarea placeholder="Enter engine details..." {...field} /></FormControl>                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="propellerType" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Propeller Type</FormLabel>
                        <FormControl><Input placeholder="Enter propeller type" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="propellerTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Propeller Time</FormLabel>
                        <FormControl><Input type="number" placeholder="Enter propeller hours" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="md:col-span-2">
                        <FormField control={form.control} name="propellerDetails" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Propeller Details</FormLabel>
                                <FormControl><Textarea placeholder="Enter propeller details..." {...field} /></FormControl>                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <div className="md:col-span-2">
                        <FormField control={form.control} name="propellerSerials" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Propeller Serial</FormLabel>
                                <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="md:col-span-2">
                        <FormField control={form.control} name="avionics" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avionics</FormLabel>
                            <FormControl><Textarea placeholder="Enter avionics details..." {...field} /></FormControl>                            <FormMessage />
                        </FormItem>
                        )} />                    </div>
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="additional" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Additional Information</FormLabel>
                            <FormControl><Textarea placeholder="Enter additional information..." {...field} /></FormControl>                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="exteriorDetails" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exterior Details</FormLabel>
                            <FormControl><Textarea placeholder="Enter exterior details..." {...field} /></FormControl>                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="interiorDetails" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Interior Details</FormLabel>
                            <FormControl><Textarea placeholder="Enter interior details..." {...field} /></FormControl>                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="inspectionStatus" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Inspection Status</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                     <div className="md:col-span-2">
                        <FormField control={form.control} name="ifr" render={({ field }) => (
                        <FormItem>
                            <FormLabel>IFR</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : isEditMode ? 'Update Listing' : 'Save'}
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
