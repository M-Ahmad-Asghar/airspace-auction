"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

export function SponsoredAdCard() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sponsored</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] w-full">
          <Image sizes="(max-width: 768px) 100vw, 50vw"
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop&crop=center"
            alt="Sponsored aircraft"
            fill
            className="object-cover rounded-b-lg"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2">Premium Aircraft Services</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Professional aircraft maintenance and inspection services.
          </p>
          <Button size="sm" className="w-full">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
