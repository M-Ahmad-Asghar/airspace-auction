import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';

const mockListings = [
  { id: '1', title: 'Vintage Leather Jacket', description: 'A classic brown leather jacket from the 80s. In great condition.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'leather jacket' },
  { id: '2', title: 'Modern Bookshelf', description: 'Sleek and minimalist bookshelf, perfect for any contemporary living room.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'modern bookshelf' },
  { id: '3', title: 'Acoustic Guitar', description: 'A beautiful acoustic guitar with a warm tone. Comes with a case.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'acoustic guitar' },
  { id: '4', title: 'Set of Ceramic Mugs', description: 'Handmade ceramic mugs, set of four. Each one is unique.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'ceramic mugs' },
  { id: '5', title: 'Mountain Bike', description: 'A durable mountain bike with 21 speeds. Great for trails and city riding.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'mountain bike' },
  { id: '6', title: 'Antique Desk Lamp', description: 'A brass desk lamp from the 1920s. Fully functional and adds a touch of class.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'desk lamp' },
];


export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-8">
            <h1 className="text-3xl font-bold mb-6">Recent Listings</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {mockListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
