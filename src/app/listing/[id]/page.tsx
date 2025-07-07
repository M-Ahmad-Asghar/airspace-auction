
import { getListingById } from '@/services/listingService';
import { ListingDetailView } from '@/components/ListingDetailView';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listingData = await getListingById(params.id);

  if (!listingData) {
    notFound();
  }

  // Serialize the listing data to make it a plain object, converting Timestamps and Dates to strings.
  const listing = JSON.parse(JSON.stringify(listingData));

  return (
    <div className="bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ListingDetailView listing={listing} />
      </main>
    </div>
  );
}
