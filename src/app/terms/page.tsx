import { StaticHeader } from '@/components/StaticHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaticHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Airplane Deals, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
              <p className="text-muted-foreground">
                Permission is granted to temporarily download one copy of the materials on Airplane Deals for personal, non-commercial transitory viewing only.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">3. Disclaimer</h2>
              <p className="text-muted-foreground">
                The materials on Airplane Deals are provided on an 'as is' basis. Airplane Deals makes no warranties, expressed or implied.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">4. Limitations</h2>
              <p className="text-muted-foreground">
                In no event shall Airplane Deals or its suppliers be liable for any damages arising out of the use or inability to use the materials on Airplane Deals.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">5. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Use, please contact us at Ops@airplanedeals.com
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
