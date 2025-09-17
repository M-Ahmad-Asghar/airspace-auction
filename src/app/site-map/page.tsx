import { StaticHeader } from '@/components/StaticHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SiteMapPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaticHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Site Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Main Pages</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-primary hover:underline">Home</Link></li>
                  <li><Link href="/home" className="text-primary hover:underline">Browse Listings</Link></li>
                  <li><Link href="/create-listing" className="text-primary hover:underline">Create Listing</Link></li>
                  <li><Link href="/my-listings" className="text-primary hover:underline">My Listings</Link></li>
                  <li><Link href="/messages" className="text-primary hover:underline">Messages</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <ul className="space-y-2">
                  <li><Link href="/home?category=Aircraft" className="text-primary hover:underline">Aircraft</Link></li>
                  <li><Link href="/home?category=Parts" className="text-primary hover:underline">Parts</Link></li>
                  <li><Link href="/home?category=Services" className="text-primary hover:underline">Services</Link></li>
                  <li><Link href="/home?category=Events" className="text-primary hover:underline">Events</Link></li>
                  <li><Link href="/home?category=Real+Estate" className="text-primary hover:underline">Real Estate</Link></li>
                  <li><Link href="/home?category=Places" className="text-primary hover:underline">Places</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Support & Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/faq" className="text-primary hover:underline">FAQ</Link></li>
                  <li><Link href="/how-to" className="text-primary hover:underline">How To</Link></li>
                  <li><Link href="/contact" className="text-primary hover:underline">Contact</Link></li>
                  <li><Link href="/terms" className="text-primary hover:underline">Terms of Use</Link></li>
                  <li><Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
                  <li><Link href="/security" className="text-primary hover:underline">Security Center</Link></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
