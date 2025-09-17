import { StaticHeader } from '@/components/StaticHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdvertiserAgreementPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaticHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Advertiser Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Advertising Services</h2>
              <p className="text-muted-foreground">
                This agreement governs the advertising services provided by Airplane Deals to advertisers and listing creators.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">2. Listing Requirements</h2>
              <p className="text-muted-foreground">
                All listings must comply with our community guidelines and applicable laws. Prohibited content includes fraudulent, misleading, or illegal items.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">3. Payment Terms</h2>
              <p className="text-muted-foreground">
                Basic listings are free. Premium features and enhanced visibility options are available for a fee as outlined in our pricing structure.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">4. Content Ownership</h2>
              <p className="text-muted-foreground">
                Advertisers retain ownership of their content but grant Airplane Deals a license to display and distribute their listings on our platform.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">5. Termination</h2>
              <p className="text-muted-foreground">
                Either party may terminate this agreement at any time. Airplane Deals reserves the right to remove listings that violate our terms.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">6. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about this agreement, contact us at Ops@airplanedeals.com
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
