import { StaticHeader } from '@/components/StaticHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HowToPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaticHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">How To Use Airplane Deals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Creating Your First Listing</h2>
              <p className="text-muted-foreground mb-2">
                Start by clicking "Create Listing" and selecting the appropriate category for your item.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Fill in all required fields (Type, Description, Photos)</li>
                <li>Add detailed information to attract buyers</li>
                <li>Upload clear, high-quality photos</li>
                <li>Set a competitive price</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">2. Finding Items to Buy</h2>
              <p className="text-muted-foreground mb-2">
                Use our search and filter tools to find exactly what you're looking for.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Browse by category (Aircraft, Parts, Services, etc.)</li>
                <li>Use location filters to find nearby items</li>
                <li>Filter by price range and other specifications</li>
                <li>Save items to your wishlist</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">3. Communicating with Users</h2>
              <p className="text-muted-foreground mb-2">
                Our messaging system helps you connect safely with other users.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Click "Message" on any listing to start a conversation</li>
                <li>Ask questions about the item before purchasing</li>
                <li>Arrange meeting times and locations</li>
                <li>Keep all communication within our platform</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">4. Safety Tips</h2>
              <p className="text-muted-foreground mb-2">
                Stay safe while buying and selling on our platform.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Meet in public places for transactions</li>
                <li>Verify item condition before payment</li>
                <li>Use secure payment methods</li>
                <li>Report suspicious activity immediately</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
