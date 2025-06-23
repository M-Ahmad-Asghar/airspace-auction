"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/ImageUploader';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  images: z.array(z.instanceof(File)).min(1, 'Please upload at least one image.').max(5, 'You can upload a maximum of 5 images.'),
});

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      images: [],
    },
  });

  const handleFilesChange = (files: File[]) => {
    form.setValue('images', files, { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Placeholder for actual submission logic (e.g., upload to Firebase Storage, save to Firestore)
    console.log('Form values:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: 'Listing Created!',
      description: "Your new listing has been successfully created.",
    });

    setIsLoading(false);
    router.push('/home');
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-8 flex items-center justify-center">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create a New Listing</CardTitle>
              <CardDescription>Fill out the details below to post your item.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Vintage Leather Jacket" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your item in detail..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                          <ImageUploader onFilesChange={handleFilesChange} maxFiles={5} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Create Listing'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
