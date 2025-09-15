import { Suspense } from 'react';
import MessagesPageClient from './MessagesPageClient';

export default function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"></div>
      </div>
    }>
      <MessagesPageClient searchParams={searchParams} />
    </Suspense>
  );
}
