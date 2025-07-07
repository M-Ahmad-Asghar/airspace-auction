
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';

interface SponsoredAdCardProps {
    imageUrl: string;
    imageHint: string;
    title: string;
    description: string;
}

export function SponsoredAdCard({ imageUrl, imageHint, title, description }: SponsoredAdCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold">Sponsored</span>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
        <Link href="#">
            <div className="relative aspect-video mb-4">
                <Image
                    src={imageUrl}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg bg-muted"
                    data-ai-hint={imageHint}
                />
            </div>
            <h4 className="font-bold mb-1 hover:underline">{title}</h4>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </CardContent>
    </Card>
  );
}
