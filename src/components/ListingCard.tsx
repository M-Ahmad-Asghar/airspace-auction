import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
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
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold mb-1 truncate">{listing.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {listing.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
