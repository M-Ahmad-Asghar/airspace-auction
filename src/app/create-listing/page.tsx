
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ImageUploader } from '@/components/ImageUploader';
import { createAircraftListing } from '@/services/listingService';
import { CATEGORIES } from '@/lib/constants';

const formSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  type: z.string().min(1, 'Type is required.'),
  images: z.array(z.instanceof(File)).min(1, 'Please upload at least one image.').max(4, 'You can upload a maximum of 4 images.'),
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
  propellerTimeMin: z.coerce.number().positive('Must be a positive number.').optional(),
  propellerTimeMax: z.coerce.number().positive('Must be a positive number.').optional(),
  propellerSerials: z.string().min(3, 'Propeller serials are required.'),
  propellerDetails: z.string().min(10, 'Propeller details are required.'),
  avionics: z.string().min(10, 'Avionics details are required.'),
  additional: z.string().optional(),
  exteriorDetails: z.string().min(10, 'Exterior details are required.'),
  interiorDetails: z.string().min(10, 'Interior details are required.'),
  inspectionStatus: z.string().min(5, 'Inspection status is required.'),
  ifr: z.string().min(3, 'IFR details are required.'),
  youtubeLink: z.string().url('Must be a valid YouTube URL.').optional().or(z.literal('')),
});

const AIRCRAFT_TYPES = [
  "Piston Single",
  "Piston Twin",
  "Warbird",
  "Turboprop",
  "Tailwheel",
  "Antique/Classic",
  "Rotorcraft",
  "Agricultural",
  "Trainer",
  "IFR Certified",
  "Light Sport",
  "Lighter than Air",
  "Special Use",
  "Jets",
  "Gliders/Sailplanes",
];

const AIRCRAFT_MANUFACTURERS = [
  "Cessna",
  "Piper",
  "Beechcraft",
  "Boeing",
  "Airbus",
  "Bombardier",
  "Embraer",
  "Cirrus",
  "Diamond",
  "Mooney",
  "Pilatus",
  "Daher",
];


export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
      propellerSerials: '',
      propellerDetails: '',
      avionics: '',
      exteriorDetails: '',
      interiorDetails: '',
      inspectionStatus: '',
      ifr: '',
      youtubeLink: '',
    },
  });

  const handleFilesChange = (files: File[]) => {
    form.setValue('images', files, { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to create a listing.' });
      return;
    }
    setIsLoading(true);
    
    try {
      await createAircraftListing(values, user.uid);

      toast({
        title: 'Listing Created!',
        description: "Your new aircraft listing has been successfully created.",
      });
      router.push('/home');
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="w-full border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold">New Classified Listing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormLabel>Add Photos</FormLabel>
                            <FormControl>
                              <ImageUploader onFilesChange={handleFilesChange} maxFiles={4} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-muted-foreground">Upgrade to 20 images & add YouTube video for $25</p>
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
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <FormControl><Input placeholder="Model" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="pt-8 border-t">
                        <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea placeholder="Describe the aircraft..." {...field} className="min-h-[150px]" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                    </div>
                    
                    <div className="space-y-6 pt-8 border-t">
                      <h3 className="text-xl font-semibold text-foreground">Aircraft Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField control={form.control} name="totalAirframeTime" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Airframe Time</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 3,100 hrs" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div />
                        
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
                        <FormItem>
                          <FormLabel>Propeller Time</FormLabel>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="propellerTimeMin" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Minimum" {...field} /></FormControl><FormMessage/></FormItem>)} />
                            <FormField control={form.control} name="propellerTimeMax" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Maximum" {...field} /></FormControl><FormMessage/></FormItem>)} />
                          </div>
                        </FormItem>
                        <FormField control={form.control} name="propellerSerials" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Propeller Serials</FormLabel>
                                <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="md:col-span-2">
                           <FormField control={form.control} name="propellerDetails" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Propeller Details</FormLabel>
                                    <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="avionics" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avionics</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="additional" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="exteriorDetails" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exterior Details</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="interiorDetails" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interior Details</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="inspectionStatus" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inspection Status</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="ifr" render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFR</FormLabel>
                            <FormControl><Input placeholder="Enter here" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="youtubeLink" render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube Link (Optional)</FormLabel>
                            <FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? 'Saving...' : 'Save'}
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
