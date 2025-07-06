
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { createPlaceListing } from '@/services/listingService';
import { CATEGORIES } from '@/lib/constants';
import { Loader2, MapPin, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const placeFormSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  images: z.array(z.instanceof(File)).min(1, 'Please upload at least one image.').max(4, 'You can upload a maximum of 4 images.'),
  location: z.string().min(3, 'Location is required.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  upgrade: z.boolean().default(false),
});

export default function CreatePlaceListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof placeFormSchema>>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      category: 'Places',
      title: '',
      images: [],
      location: '',
      description: '',
      upgrade: false,
    },
  });

  const handleFilesChange = (files: File[]) => {
    form.setValue('images', files, { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof placeFormSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to create a listing.' });
      return;
    }
    setIsLoading(true);

    try {
      await createPlaceListing(values, user.uid);
      toast({
        title: 'Listing Created!',
        description: "Your new place listing has been successfully created.",
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
            <div className="mb-10">
              <h1 className="text-3xl font-bold">New Classified Listing</h1>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                
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

                <div className="pt-8 border-t">
                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                         <FormLabel className="text-base font-semibold">Add Photos</FormLabel>
                        <FormControl>
                          <ImageUploader onFilesChange={handleFilesChange} maxFiles={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="upgrade"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            Upgrade to 20 images & add YouTube video for $25
                            </FormLabel>
                        </div>
                        </FormItem>
                    )}
                />

                <div className="space-y-8 pt-8 border-t">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Hidden Waterfall & Swimming Hole" {...field} /></FormControl>
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
                    
                     <FormField control={form.control} name="description" render={({ field }) => (
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
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? (<> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>) : 'Save'}
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
