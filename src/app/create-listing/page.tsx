
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
import { createAircraftListing, getYoutubeVideoDetails, type YoutubeVideoDetails, getListingById, updateListing } from '@/services/listingService';
import { CATEGORIES, AIRCRAFT_TYPES, AIRCRAFT_MANUFACTURERS, AIRCRAFT_MODELS } from '@/lib/constants';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const formSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  type: z.string().min(1, 'Type is required.'),
  images: z.any().refine(files => files?.length >= 1, 'Please upload at least one image.').refine(files => files?.length <= 4, 'You can upload a maximum of 4 images.'),
  location: z.string().min(3, 'Location is required.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  registration: z.string().min(1, 'Registration is required.'),
  year: z.coerce.number().int().min(1900, 'Year must be after 1900.').max(new Date().getFullYear() + 1, `Year can't be in the future.`),
  manufacturer: z.string().min(2, 'Manufacturer is required.'),
  model: z.string().min(1, 'Model is required.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  totalAirframeTime: z.coerce.number().positive('Must be a positive number.'),
  engineTimeMin: z.coerce.number().positive('Must be a positive number.').optional(),
  engineTimeMax: z.coerce.number().positive('Must be a positive number.').optional(),
  engineDetails: z.string().min(10, 'Engine details are required.'),
  propellerType: z.string().min(3, 'Propeller type is required.'),
  propellerTimeMin: z.coerce.number().positive('Must be a positive number.').optional(),
  propellerTimeMax: z.coerce.number().positive('Must be a positive number.').optional(),
  propellerDetails: z.string().min(10, 'Propeller details are required.'),
  propellerSerials: z.string().min(3, 'Propeller serials are required.'),
  avionics: z.string().min(10, 'Avionics details are required.'),
  additional: z.string().optional(),
  exteriorDetails: z.string().min(10, 'Exterior details are required.'),
  interiorDetails: z.string().min(10, 'Interior details are required.'),
  inspectionStatus: z.string().min(5, 'Inspection status is required.'),
  ifr: z.string().min(3, 'IFR details are required.'),
  youtubeLink: z.string().url('Must be a valid YouTube URL.').optional().or(z.literal('')),
});

export default function CreateListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');
  const isEditMode = !!listingId;

  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [youtubeDetails, setYoutubeDetails] = useState<YoutubeVideoDetails | null>(null);
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);
  const [showDescriptionInfo, setShowDescriptionInfo] = useState(true);
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
      totalAirframeTime: undefined,
      engineDetails: '',
      propellerType: '',
      propellerDetails: '',
      propellerSerials: '',
      avionics: '',
      exteriorDetails: '',
      interiorDetails: '',
      inspectionStatus: '',
      ifr: '',
      youtubeLink: '',
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


  const youtubeLinkValue = useWatch({
    control: form.control,
    name: 'youtubeLink',
  });

  const extractVideoId = (url: string): string | null => {
      if (!url) return null;
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
  };

  const fetchDetails = useCallback(async (link: string) => {
    const videoId = extractVideoId(link);
    if (videoId) {
      setIsFetchingYoutube(true);
      setYoutubeDetails(null);
      try {
        const details = await getYoutubeVideoDetails(videoId);
        setYoutubeDetails(details);
      } catch (error) {
        console.error("Failed to fetch YouTube details", error);
        setYoutubeDetails(null);
        toast({
          variant: 'destructive',
          title: 'Invalid YouTube Link',
          description: 'Could not fetch video details. Please check the URL.',
        });
      } finally {
        setIsFetchingYoutube(false);
      }
    } else {
      setYoutubeDetails(null);
    }
  }, [toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const { isDirty } = form.getFieldState('youtubeLink');
      if (youtubeLinkValue && isDirty) {
        fetchDetails(youtubeLinkValue);
      } else if (!youtubeLinkValue) {
        setYoutubeDetails(null);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [youtubeLinkValue, fetchDetails, form]);


  const handleFilesChange = (files: (File | string)[]) => {
    form.setValue('images', files, { shouldValidate: true });
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
        await createAircraftListing(values, user.uid);
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
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
                        <p className="text-sm text-muted-foreground pt-2">Upgrade to 20 images & add YouTube video for $25</p>
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
                  <FormField control={form.control} name="registration" render={({ field }) => (
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
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select manufacturer" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AIRCRAFT_MANUFACTURERS.map(manufacturer => <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a model" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AIRCRAFT_MODELS.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="pt-8 border-t">
                    <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea placeholder="Describe the aircraft..." {...field} className="min-h-[150px]" />
                            {showDescriptionInfo && (
                                <Alert className="absolute bottom-4 left-4 right-4 w-auto max-w-md bg-background/90 backdrop-blur-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                    Just start typing or fill in the fields below. Our system will automatically organize your details.
                                    </AlertDescription>
                                    <button type="button" onClick={() => setShowDescriptionInfo(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                                        <X className="h-4 w-4"/>
                                    </button>
                                </Alert>
                            )}
                          </div>
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
                    
                    <FormItem>
                      <FormLabel>Engine Time</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="engineTimeMin" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Minimum" {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="engineTimeMax" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Maximum" {...field} /></FormControl><FormMessage/></FormItem>)} />
                      </div>
                    </FormItem>
                    <FormField control={form.control} name="engineDetails" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engine Details</FormLabel>
                        <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="propellerType" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Propeller Type</FormLabel>
                        <FormControl><Input placeholder="Enter propeller type" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormItem className="md:col-span-2">
                      <FormLabel>Propeller Time</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="propellerTimeMin" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Minimum" {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="propellerTimeMax" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Maximum" {...field} /></FormControl><FormMessage/></FormItem>)} />
                      </div>
                    </FormItem>

                    <div className="md:col-span-2">
                        <FormField control={form.control} name="propellerDetails" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Propeller Details</FormLabel>
                                <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <div className="md:col-span-2">
                        <FormField control={form.control} name="propellerSerials" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Propeller Serials</FormLabel>
                                <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="md:col-span-2">
                        <FormField control={form.control} name="avionics" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avionics</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="additional" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Additional</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="exteriorDetails" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exterior Details</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                    <div className="md:col-span-2">
                        <FormField control={form.control} name="interiorDetails" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Interior Details</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
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
                    <FormField control={form.control} name="youtubeLink" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>YouTube Link (Optional)</FormLabel>
                        <FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} /></FormControl>
                        <FormMessage />
                         {isFetchingYoutube && <div className="flex items-center text-sm text-muted-foreground pt-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching video details...</div>}
                         {youtubeDetails && (
                            <div className="mt-4 flex gap-4 items-center rounded-lg border p-3">
                                <div className="relative h-24 w-32 flex-shrink-0">
                                <Image src={youtubeDetails.thumbnailUrl} alt={youtubeDetails.title} layout="fill" objectFit="cover" className="rounded-md" />
                                </div>
                                <div>
                                <p className="font-semibold">{youtubeDetails.title}</p>
                                <p className="text-sm text-muted-foreground">{youtubeDetails.author}</p>
                                </div>
                            </div>
                        )}
                      </FormItem>
                    )} />
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
