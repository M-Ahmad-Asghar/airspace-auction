import { StaticHeader } from '@/components/StaticHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaticHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create a listing?</AccordionTrigger>
                <AccordionContent>
                  To create a listing, click on "Create Listing" in the header, select your category, fill out the required information, upload photos, and submit your listing.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I contact a seller?</AccordionTrigger>
                <AccordionContent>
                  Click on the "Message" button on any listing to start a conversation with the seller. You can also use the contact information provided in the listing.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it free to list items?</AccordionTrigger>
                <AccordionContent>
                  Yes, creating basic listings is completely free. We offer premium features for enhanced visibility and additional photos.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I edit or delete my listing?</AccordionTrigger>
                <AccordionContent>
                  Go to "My Listings" in your account dashboard to view, edit, or delete your active listings.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We facilitate communication between buyers and sellers. Payment arrangements are made directly between parties.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
