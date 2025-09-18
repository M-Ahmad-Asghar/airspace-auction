import { getListingById } from '@/services/listingService';
import { ListingDetailView } from '@/components/ListingDetailView';
import { SimilarListings } from '@/components/SimilarListings';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const listingData = await getListingById(resolvedParams.id);

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
        
        {/* Similar Listings */}
        {/* <div className="mt-12">
          <SimilarListings 
            listingId={listing.id}
            category={listing.category}
          />
        </div> */}
      </main>
    </div>
  );
}
