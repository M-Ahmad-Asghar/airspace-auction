import { StaticHeader } from '@/components/StaticHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaticHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Security Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Account Security</h2>
              <p className="text-muted-foreground">
                Keep your account secure by using strong passwords and enabling two-factor authentication when available.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Safe Trading Practices</h2>
              <p className="text-muted-foreground">
                Always verify the identity of buyers and sellers before completing transactions. Meet in public places for in-person exchanges.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Reporting Suspicious Activity</h2>
              <p className="text-muted-foreground">
                If you encounter suspicious listings or users, please report them immediately to our support team.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Data Protection</h2>
              <p className="text-muted-foreground">
                We use industry-standard encryption to protect your personal and financial information.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Contact Security Team</h2>
              <p className="text-muted-foreground">
                For security concerns, contact us at Ops@airplanedeals.com
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
